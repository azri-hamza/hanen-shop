import { IsNumber, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: ['increment', 'decrement'] })
  @IsIn(['increment', 'decrement'])
  operation: 'increment' | 'decrement';
}
