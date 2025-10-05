import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getUserCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id }, isCheckedOut: false },
    });

    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(user: User, createCartItemDto: CreateCartItemDto) {
    const { productId, quantity } = createCartItemDto;
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const cart = await this.getUserCart(user);

    let item = cart.items.find((i) => i.product.id === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepository.create({ product, quantity, cart });
      cart.items.push(item);
    }

    await this.cartRepository.save(cart);
    return cart;
  }

  async updateItem(user: User, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const cart = await this.getUserCart(user);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    Object.assign(item, updateCartItemDto);
    await this.cartRepository.save(cart);
    return cart;
  }

  async removeItem(user: User, itemId: string) {
    const cart = await this.getUserCart(user);
    const itemIndex = cart.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) throw new NotFoundException('Item no encontrado');

    cart.items.splice(itemIndex, 1);
    await this.cartRepository.save(cart);
    return cart;
  }

  async clearCart(user: User) {
    const cart = await this.getUserCart(user);
    cart.items = [];
    await this.cartRepository.save(cart);
    return cart;
  }
}
