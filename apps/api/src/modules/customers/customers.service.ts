import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryRunner } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(search?: string): Promise<Customer[]> {
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    return this.customerRepo.find({
      where,
      order: { totalDebt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: { transactions: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id "${id}" not found`);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create(dto);
    return this.customerRepo.save(customer);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async recalculateDebt(customerId: string, queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.manager
      .createQueryBuilder()
      .select('COALESCE(SUM("amount"), 0)', 'total')
      .from(Transaction, 'transaction')
      .where('"customerId" = :customerId', { customerId })
      .getRawOne<{ total: string }>();

    await queryRunner.manager.update(Customer, customerId, {
      totalDebt: parseFloat(result?.total ?? '0'),
    });
  }
}
