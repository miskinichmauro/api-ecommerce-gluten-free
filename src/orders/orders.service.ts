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
      }),
    );

    const total = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    const order = this.orderRepository.create({
      user,
      items,
      shippingAddress,
      billingProfile,
      total,
      status: 'pending',
      notes: checkoutDto.notes,
    });

    await this.orderRepository.save(order);

    cart.isCheckedOut = true;
    cart.updatedAt = new Date();
    await this.cartRepository.save(cart);

    return order;
  }

  async findAll(user: User, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(user: User, id: string) {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }
}
