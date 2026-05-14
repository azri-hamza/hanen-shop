import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from '@hanen-shop/shared-types';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async getSummary() {
    const lowStockProducts = await this.productRepo.find({
      where: { stockQuantity: 0 },
      order: { stockQuantity: 'ASC' },
    });

    const lowStockThreshold = 5;
    const lowStock = lowStockProducts.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold,
    );

    const topDebtors = await this.customerRepo.find({
      order: { totalDebt: 'DESC' },
      take: 5,
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRevenueResult = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.SALE })
      .andWhere('t.createdAt >= :start', { start: todayStart })
      .andWhere('t.createdAt <= :end', { end: todayEnd })
      .getRawOne<{ total: string }>();

    const todayPaymentsResult = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: TransactionType.PAYMENT })
      .andWhere('t.createdAt >= :start', { start: todayStart })
      .andWhere('t.createdAt <= :end', { end: todayEnd })
      .getRawOne<{ total: string }>();

    return {
      lowStockProducts: [
        ...lowStock,
        ...lowStockProducts.filter((p) => p.stockQuantity === 0),
      ],
      topDebtors,
      todayRevenue: parseFloat(todayRevenueResult?.total ?? '0'),
      todayPayments: parseFloat(todayPaymentsResult?.total ?? '0'),
    };
  }
}
