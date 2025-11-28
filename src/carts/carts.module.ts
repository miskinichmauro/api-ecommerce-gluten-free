import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { Product } from 'src/products/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    AuthModule,
    FilesModule,
    TypeOrmModule.forFeature([Cart, CartItem, Product])
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
