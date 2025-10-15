import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from 'src/products/entities';
import { Cart } from 'src/carts/entities/cart.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
  })
  password: string;

  @Column({
    type: 'text',
  })
  fullName: string;

  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  roles: string[];

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart;

  @BeforeInsert()
  @BeforeUpdate()
  checkEmail(): void {
    this.email = this.email.toLowerCase().trim();
  }
}
