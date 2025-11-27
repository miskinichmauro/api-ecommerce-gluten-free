import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { OrdersService } from './orders.service';

@ApiTags('Pedidos')
@Controller('orders')
@Auth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los pedidos del usuario' })
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.ordersService.findAll(user, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un pedido por id' })
  findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.ordersService.findOne(user, id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Genera un pedido a partir del carrito' })
  checkout(@GetUser() user: User, @Body() checkoutDto: CheckoutDto) {
    return this.ordersService.checkout(user, checkoutDto);
  }
}
