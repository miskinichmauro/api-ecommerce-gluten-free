import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-card-item.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly fileService: FilesService,
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

  async getCart(user: User) {
    const cart = await this.getUserCart(user);
    return this.mapCartResponse(cart);
  }

  async addItem(user: User, createCartItemDto: CreateCartItemDto) {
    const { productId, quantity } = createCartItemDto;
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product)
      throw new NotFoundException({
        message: 'Producto no encontrado',
        code: 'CART_PRODUCT_NOT_FOUND',
        expose: true,
      });

    const cart = await this.getUserCart(user);

    let item = cart.items.find((i) => i.product.id === productId);

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepository.create({ product, quantity, cart });
      cart.items.push(item);
    }

    await this.cartRepository.save(cart);
    return this.mapCartResponse(cart);
  }

  async updateItem(user: User, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const cart = await this.getUserCart(user);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item)
      throw new NotFoundException({
        message: 'Item no encontrado en el carrito',
        code: 'CART_ITEM_NOT_FOUND',
        expose: true,
      });

    Object.assign(item, updateCartItemDto);
    await this.cartRepository.save(cart);
    return this.mapCartResponse(cart);
  }

  async removeItem(user: User, itemId: string) {
    const cart = await this.getUserCart(user);
    const itemIndex = cart.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1)
      throw new NotFoundException({
        message: 'Item no encontrado',
        code: 'CART_ITEM_NOT_FOUND',
        expose: true,
      });

    cart.items.splice(itemIndex, 1);
    await this.cartRepository.save(cart);
    return this.mapCartResponse(cart);
  }

  async clearCart(user: User) {
    const cart = await this.getUserCart(user);
    cart.items = [];
    await this.cartRepository.save(cart);
    return this.mapCartResponse(cart);
  }

  async removeAll() {
    await this.cartItemRepository.createQueryBuilder().delete().where({}).execute();
    await this.cartRepository.createQueryBuilder().delete().where({}).execute();
  }

  private mapCartResponse(cart: Cart) {
    const mapImages = (product: Product) =>
      product.images?.map((img) => this.fileService.getPublicUrl('products', img.fileName)) ?? [];

    return {
      ...cart,
      items: cart.items?.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: mapImages(item.product),
        },
      })),
    };
  }
}
