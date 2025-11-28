import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/addresses/entities/address.entity';
import { User } from 'src/auth/entities/user.entity';
import { BillingProfile } from 'src/billing/entities/billing-profile.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CheckoutDto } from './dto/checkout.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FilesService } from 'src/files/files.service';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(BillingProfile)
    private readonly billingRepository: Repository<BillingProfile>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly fileService: FilesService,
  ) {}

  async checkout(user: User, checkoutDto: CheckoutDto) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id }, isCheckedOut: false },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('No hay productos en el carrito');
    }

    const shippingAddress = await this.addressRepository.findOne({
      where: { id: checkoutDto.shippingAddressId, user: { id: user.id } },
    });

    if (!shippingAddress) {
      throw new NotFoundException('Direccion de envio no encontrada');
    }

    let billingProfile: BillingProfile | null = null;
    if (checkoutDto.billingProfileId) {
      billingProfile = await this.billingRepository.findOne({
        where: { id: checkoutDto.billingProfileId, user: { id: user.id } },
      });

      if (!billingProfile) {
        throw new NotFoundException('Dato de facturacion no encontrado');
      }
    } else {
      billingProfile =
        (await this.billingRepository.findOne({
          where: { user: { id: user.id }, isDefault: true },
        })) || null;
    }

    const items = cart.items.map((item) =>
      this.orderItemRepository.create({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
        productSnapshot: this.buildProductSnapshot(item.product),
      }),
    );

    const total = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    const orderNumber = await this.generateOrderNumber();
    const shippingSnapshot = shippingAddress
      ? {
          id: shippingAddress.id,
          label: shippingAddress.label,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
          notes: shippingAddress.notes,
        }
      : null;

    const billingSnapshot = billingProfile
      ? {
        id: billingProfile.id,
        legalName: billingProfile.legalName,
        taxId: billingProfile.taxId,
        email: billingProfile.email,
        phone: billingProfile.phone,
        addressLine1: billingProfile.addressLine1,
        addressLine2: billingProfile.addressLine2,
        city: billingProfile.city,
        state: billingProfile.state,
        country: billingProfile.country,
        postalCode: billingProfile.postalCode,
      }
      : null;

    const order = this.orderRepository.create({
      user,
      items,
      shippingAddress,
      billingProfile,
      shippingSnapshot,
      billingSnapshot,
      orderNumber,
      total,
      status: 'pending',
      notes: checkoutDto.notes,
    });

    await this.orderRepository.save(order);

    cart.isCheckedOut = true;
    cart.updatedAt = new Date();
    await this.cartRepository.save(cart);

    return this.mapOrderResponse(order);
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const orders = await this.orderRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return orders.map((order) => this.mapOrderResponse(order));
  }

  async findOne(user: User, id: string) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return this.mapOrderResponse(order);
  }

  private async generateOrderNumber(): Promise<string> {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const date = new Date();
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());

    for (let i = 0; i < 5; i++) {
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      const candidate = `ORD-${y}${m}${d}-${random}`;

      const exists = await this.orderRepository.exist({
        where: { orderNumber: candidate },
      });
      if (!exists) return candidate;
    }

    throw new BadRequestException('No se pudo generar el numero de pedido');
  }

  private mapOrderResponse(order: Order) {
    const shippingAddress = order.shippingAddress ?? order.shippingSnapshot ?? null;
    const billingProfile = order.billingProfile ?? order.billingSnapshot ?? null;

    return {
      ...order,
      shippingAddress,
      billingProfile,
      items: order.items?.map((item) => {
        const product = this.mapProductWithImages(item.product, item.productSnapshot);
        return {
          ...item,
          product,
        };
      }),
    };
  }

  private mapProductWithImages(product?: Product | null, snapshot?: Record<string, any> | null) {
    if (product) {
      const fileNames = product.images?.map((img) => img.fileName) ?? [];
      return {
        ...product,
        images: this.mapImageNames(fileNames),
      };
    }

    const snap = snapshot ?? {};
    const fileNames: string[] = Array.isArray((snap as any).images) ? (snap as any).images : [];
    return {
      ...snap,
      images: this.mapImageNames(fileNames),
    };
  }

  private mapImageNames(fileNames: string[]) {
    return fileNames.map((fileName) => this.fileService.getPublicUrl('products', fileName));
  }

  private buildProductSnapshot(product: Product) {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      slug: product.slug,
      stock: product.stock,
      isFeatured: product.isFeatured,
      images: product.images?.map((img) => img.fileName) ?? [],
      category: product.category
        ? { id: product.category.id, name: product.category.name, description: product.category.description }
        : undefined,
      tags: product.tags?.map((tag) => ({ id: tag.id, name: tag.name })) ?? [],
    };
  }
}
