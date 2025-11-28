import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from 'src/products/entities';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true, nullable: true, onDelete: 'SET NULL' })
  product: Product | null;

  @Column('int')
  quantity: number;

  @Column('float')
  unitPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  productSnapshot?: Record<string, any> | null;
}
