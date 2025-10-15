import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, Column } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.carts, { eager: true })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @Column({ default: false })
  isCheckedOut: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
