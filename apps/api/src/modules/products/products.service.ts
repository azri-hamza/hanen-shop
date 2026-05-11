import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(search?: string, category?: string): Promise<Product[]> {
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    return this.productRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      stockQuantity: dto.stockQuantity ?? 0,
      unit: dto.unit ?? 'piece',
    });

    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async adjustStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.operation === 'decrement') {
      if (product.stockQuantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${dto.quantity}`,
        );
      }
      product.stockQuantity -= dto.quantity;
    } else {
      product.stockQuantity += dto.quantity;
    }

    return this.productRepo.save(product);
  }
}
