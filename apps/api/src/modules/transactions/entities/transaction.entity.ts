import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TransactionType } from '@hanen-shop/shared-types';
import { Customer } from '../../customers/entities/customer.entity';
import { TransactionItem } from '../../transaction-item/entities/transaction-item.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.transactions)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TransactionItem, (item) => item.transaction, {
    cascade: ['insert'],
  })
  items: TransactionItem[];
}
