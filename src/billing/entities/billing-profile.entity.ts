import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Entity('billing_profiles')
export class BillingProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.billingProfiles, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'text' })
  legalName: string;

  @Column({ type: 'text' })
  taxId: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ type: 'text' })
  addressLine1: string;

  @Column({ type: 'text', nullable: true })
  addressLine2?: string;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text', nullable: true })
  state?: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text', nullable: true })
  postalCode?: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
