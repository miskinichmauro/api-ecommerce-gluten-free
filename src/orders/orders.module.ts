import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Address } from 'src/addresses/entities/address.entity';
import { BillingProfile } from 'src/billing/entities/billing-profile.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { FilesModule } from 'src/files/files.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [
    AuthModule,
    FilesModule,
    TypeOrmModule.forFeature([Order, OrderItem, Address, BillingProfile, Cart]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
