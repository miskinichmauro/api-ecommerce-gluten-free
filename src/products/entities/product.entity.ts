import { BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./producto-images.entity";
import { User } from "src/auth/entities/user.entity";
import { normalizeSlug } from "src/common/utils/util";

@Entity({name: 'products'})
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    title: string;

    @Column({
        type: 'float',
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        default: 0
    })
    unitOfMeasure: string;

    @Column('text')
    description: string;

    @Column({
        type: 'text', 
        unique: true
    })
    slug: string;

    @Column({
        type: 'int', 
        default: 0
    })
    stock: number;

    @Column({
        type: 'text', 
        array: true,
        default: []
    })
    tags: string[];

    @DeleteDateColumn()
    deleteAt: Date;

    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { 
            cascade: true,
            eager: true
        }
    )
    imagesName?: ProductImage[];

    @ManyToOne(
        () => User,
        user => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkTagsInsert() {
        if (this.tags?.length > 0)
            this.tags.forEach(item => item.toLowerCase());
    }

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug){
            this.slug = this.title
        }

        this.slug = normalizeSlug(this.slug.trim())
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = normalizeSlug(this.slug.trim())
    }
}
