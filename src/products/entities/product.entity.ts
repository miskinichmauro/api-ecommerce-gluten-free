import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './producto-images.entity';
import { User } from 'src/auth/entities/user.entity';
import { normalizeSlug } from 'src/common/utils/util';
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ type: 'text', default: 'unidad' })
  unitOfMeasure: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'bool', default: false })
  isFeatured: boolean;

  @DeleteDateColumn()
  deleteAt: Date;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @ManyToOne(() => Category, (category) => category.products, { eager: true, nullable: false })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true, eager: true })
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags?: Tag[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = normalizeSlug(this.slug.trim());
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = normalizeSlug(this.slug.trim());
  }
}
