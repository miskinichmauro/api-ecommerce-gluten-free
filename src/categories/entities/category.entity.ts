import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'bool', default: false })
  isFeatured: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
