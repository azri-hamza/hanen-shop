import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionItem } from './entities/transaction-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionItem])],
})
export class TransactionItemModule {}
