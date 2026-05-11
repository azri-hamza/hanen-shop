import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransactionType } from '@hanen-shop/shared-types';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from '../transaction-item/entities/transaction-item.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(TransactionItem)
    private readonly transactionItemRepo: Repository<TransactionItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
    private readonly customersService: CustomersService,
  ) {}

  async createSale(dto: CreateSaleDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id "${dto.customerId}" not found`);
      }

      const items: { product: Product; quantity: number }[] = [];

      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with id "${item.productId}" not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}`,
          );
        }

        items.push({ product, quantity: item.quantity });
      }

      let totalAmount = 0;
      for (const { product, quantity } of items) {
        totalAmount += Number(product.price) * quantity;
      }

      const transaction = await queryRunner.manager.save(Transaction, {
        customerId: dto.customerId,
        type: TransactionType.SALE,
        amount: totalAmount,
        note: dto.note,
      });

      for (const { product, quantity } of items) {
        await queryRunner.manager.save(TransactionItem, {
          transactionId: transaction.id,
          productId: product.id,
          quantity,
          unitPrice: Number(product.price),
        });

        await queryRunner.manager.update(Product, product.id, {
          stockQuantity: product.stockQuantity - quantity,
        });
      }

      await this.customersService.recalculateDebt(dto.customerId, queryRunner);

      await queryRunner.commitTransaction();

      return this.transactionRepo.findOne({
        where: { id: transaction.id },
        relations: { items: true },
      }) as Promise<Transaction>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createPayment(dto: CreatePaymentDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id "${dto.customerId}" not found`);
      }

      const transaction = await queryRunner.manager.save(Transaction, {
        customerId: dto.customerId,
        type: TransactionType.PAYMENT,
        amount: dto.amount,
        note: dto.note,
      });

      await this.customersService.recalculateDebt(dto.customerId, queryRunner);

      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerLedger(customerId: string): Promise<Transaction[]> {
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id "${customerId}" not found`);
    }

    return this.transactionRepo.find({
      where: { customerId },
      relations: {
        items: { product: true },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
