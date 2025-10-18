import { Column, DeleteDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    name: string;
    
    @DeleteDateColumn()
    deleteAt: Date;
}
