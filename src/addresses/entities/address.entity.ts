import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'text' })
  fullName: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text' })
  street: string;

  @Column({ type: 'text', nullable: true })
  apartment?: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text', nullable: true })
  state?: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text', nullable: true })
  postalCode?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
