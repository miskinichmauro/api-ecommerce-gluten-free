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
import { Address } from 'src/addresses/entities/address.entity';
import { BillingProfile } from 'src/billing/entities/billing-profile.entity';
import { Order } from 'src/orders/entities/order.entity';

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

  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

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

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => BillingProfile, (billing) => billing.user)
  billingProfiles: BillingProfile[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  checkEmail(): void {
    this.email = this.email.toLowerCase().trim();
  }
}
