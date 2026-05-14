import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) =>
        value !== null ? parseFloat(value) : null,
    },
  })
  price: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar' })
  unit: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
