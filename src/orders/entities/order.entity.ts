import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { BillingProfile } from 'src/billing/entities/billing-profile.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ManyToOne(() => Address, { eager: true, nullable: true })
  shippingAddress?: Address | null;

  @ManyToOne(() => BillingProfile, { eager: true, nullable: true })
  billingProfile?: BillingProfile | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column('float', { default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
