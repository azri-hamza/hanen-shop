import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('sale')
  @ApiOperation({ summary: 'Create a sale transaction with stock validation' })
  createSale(@Body() dto: CreateSaleDto) {
    return this.transactionsService.createSale(dto);
  }

  @Post('payment')
  @ApiOperation({ summary: 'Create a payment transaction' })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.transactionsService.createPayment(dto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all transactions for a customer with items and product names' })
  getCustomerLedger(@Param('customerId') customerId: string) {
    return this.transactionsService.getCustomerLedger(customerId);
  }
}
