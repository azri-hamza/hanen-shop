import { IsUUID, IsArray, IsString, IsOptional, Min, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SaleItemDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
