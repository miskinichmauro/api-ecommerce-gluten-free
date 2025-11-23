import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  imageUrl: string;

  @Column('text')
  redirectUrl: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
