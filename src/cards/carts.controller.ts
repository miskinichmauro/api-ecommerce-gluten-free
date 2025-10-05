import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
@Auth()
export class CartsController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtiene el carrito actual del usuario autenticado' })
  async getCart(@GetUser() user: User) {
    return await this.cartService.getUserCart(user);
  }

  @Post('items')
  @ApiOperation({ summary: 'Agrega un producto al carrito' })
  async addItem(@GetUser() user: User, @Body() dto: CreateCartItemDto) {
    return await this.cartService.addItem(user, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualiza la cantidad de un producto en el carrito' })
  async updateItem(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateItem(user, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Elimina un producto del carrito' })
  async removeItem(@GetUser() user: User, @Param('id') id: string) {
    return await this.cartService.removeItem(user, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Vacía completamente el carrito' })
  async clearCart(@GetUser() user: User) {
    return await this.cartService.clearCart(user);
  }
}
