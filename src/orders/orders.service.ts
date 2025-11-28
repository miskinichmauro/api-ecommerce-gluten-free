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
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { MailService } from 'src/mail/mail.service';

type SnapshotCategory = { id: string; name: string; description?: string };
type SnapshotTag = { id: string; name: string };

type ProductSnapshot = {
  id: string;
  title: string;
  price: number;
  description?: string;
  slug: string;
  stock: number;
  isFeatured: boolean;
  images: string[];
  category?: SnapshotCategory | undefined;
  tags?: SnapshotTag[];
};

type MappedProduct =
  | (Omit<Product, 'images' | 'category' | 'tags'> & {
      images: string[];
      category?: Category | SnapshotCategory;
      tags?: (Tag | SnapshotTag)[];
    })
  | (Partial<Omit<Product, 'images' | 'category' | 'tags'>> & ProductSnapshot);
type MappedOrderItem = Omit<OrderItem, 'product'> & { product: MappedProduct | null };
type MappedOrder = Omit<Order, 'items' | 'shippingAddress' | 'billingProfile'> & {
  items?: MappedOrderItem[];
  shippingAddress: Address | Record<string, any> | null;
  billingProfile: BillingProfile | Record<string, any> | null;
  createdAtParaguay?: string;
};

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
    private readonly mailService: MailService,
  ) {}

  async checkout(user: User, checkoutDto: CheckoutDto) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id }, isCheckedOut: false },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException({
        message: 'No hay productos en el carrito',
        code: 'ORDER_EMPTY_CART',
        expose: true,
      });
    }

    const shippingAddress = await this.addressRepository.findOne({
      where: { id: checkoutDto.shippingAddressId, user: { id: user.id } },
    });

    if (!shippingAddress) {
      throw new NotFoundException({
        message: 'Dirección de envío no encontrada',
        code: 'ORDER_SHIPPING_NOT_FOUND',
        expose: true,
      });
    }

    let billingProfile: BillingProfile | null = null;
    if (checkoutDto.billingProfileId) {
      billingProfile = await this.billingRepository.findOne({
        where: { id: checkoutDto.billingProfileId, user: { id: user.id } },
      });

      if (!billingProfile) {
        throw new NotFoundException({
          message: 'Dato de facturación no encontrado',
          code: 'ORDER_BILLING_NOT_FOUND',
          expose: true,
        });
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

    const orderResponse = this.mapOrderResponse(order);

    void this.sendOrderMail(user, orderResponse).catch((error) =>
      console.error('No se pudo enviar el correo de confirmación', error),
    );

    return orderResponse;
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
      throw new NotFoundException({
        message: 'Pedido no encontrado',
        code: 'ORDER_NOT_FOUND',
        expose: true,
      });
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

    throw new BadRequestException({
      message: 'No se pudo generar el número de pedido',
      code: 'ORDER_NUMBER_GENERATION_FAILED',
      expose: true,
    });
  }

  private mapOrderResponse(order: Order): MappedOrder {
    const shippingAddress = order.shippingAddress ?? order.shippingSnapshot ?? null;
    const billingProfile = order.billingProfile ?? order.billingSnapshot ?? null;
    const createdAtParaguay = this.formatDateToParaguay(order.createdAt);

    const items: MappedOrderItem[] | undefined = order.items?.map((item) => {
      const product = this.mapProductWithImages(
        item.product,
        item.productSnapshot as ProductSnapshot | null | undefined,
      );
      return {
        ...item,
        product,
      };
    });

    const base: Omit<Order, 'items' | 'shippingAddress' | 'billingProfile'> = {
      ...(order as Omit<Order, 'items' | 'shippingAddress' | 'billingProfile'>),
    };

    return {
      ...base,
      shippingAddress,
      billingProfile,
      items,
      createdAtParaguay,
    };
  }

  private mapProductWithImages(
    product?: Product | null,
    snapshot?: ProductSnapshot | null,
  ): MappedProduct {
    if (product) {
      const fileNames = product.images?.map((img) => img.fileName) ?? [];
    return {
      ...(product as Omit<Product, 'images' | 'category' | 'tags'>),
      category: product.category,
      tags: product.tags,
      images: this.mapImageNames(fileNames),
    };
    }

    const snap: ProductSnapshot =
      snapshot ?? {
        id: '',
        title: 'Producto',
        price: 0,
        slug: '',
        stock: 0,
        isFeatured: false,
        images: [],
        description: '',
      };
    const fileNames: string[] = Array.isArray(snap.images) ? snap.images : [];
    return {
      ...(snap as Partial<Omit<Product, 'images' | 'category' | 'tags'>>),
      id: snap.id,
      title: snap.title,
      price: snap.price,
      description: snap.description,
      slug: snap.slug,
      stock: snap.stock,
      isFeatured: snap.isFeatured,
      category: snap.category,
      tags: snap.tags,
      images: this.mapImageNames(fileNames),
    };
  }

  private mapImageNames(fileNames: string[]) {
    return fileNames.map((fileName) => this.fileService.getPublicUrl('products', fileName));
  }

  private buildProductSnapshot(product: Product): ProductSnapshot {
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

  private async sendOrderMail(user: User, order: MappedOrder) {
    const currency = this.formatCurrency(order.total);
    const createdAt =
      order.createdAtParaguay ?? this.formatDateToParaguay(order.createdAt) ?? '';

    const status =
      (order.status ?? 'pending')
        .toString()
        .replace('_', ' ')
        .toLowerCase() === 'pending'
        ? 'Pendiente'
        : (order.status ?? '').toString();

    const itemsRows =
      order.items
        ?.map((item) => {
          const img = (item.product?.images ?? [])[0] ?? '';
          const title = item.product?.title ?? 'Producto';
          const desc = item.product?.description ?? '';
          const quantity = item.quantity ?? 1;
          const unitPrice = this.formatCurrency(item.unitPrice);
          const subtotal = this.formatCurrency((item.unitPrice ?? 0) * quantity);

          return `
          <div
            style="
              display:flex;
              background:#ffffff;
              border:1px solid #e5e7eb;
              border-radius:12px;
              overflow:hidden;
              margin-bottom:12px;
            "
          >
            <a
              href="#"
              style="
                width:150px;
                flex-shrink:0;
                display:block;
              "
            >
              <img
                src="${img}"
                alt="${title}"
                style="width:100%;height:110px;object-fit:cover;display:block;"
              />
            </a>
            <div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;">
              <div>
                <a
                  href="#"
                  style="
                    margin:0;
                    font-weight:600;
                    font-size:15px;
                    color:#111827;
                    text-decoration:none;
                    display:block;
                  "
                >
                  ${title}
                </a>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.4;">
                  ${desc}
                </p>
              </div>
              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  align-items:flex-end;
                  margin-top:auto;
                  font-size:13px;
                  color:#4b5563;
                "
              >
                <span>
                  ${quantity} x ${unitPrice}
                </span>
                <span style="font-weight:700;color:#111827;">
                  ${subtotal}
                </span>
              </div>
            </div>
          </div>
        `;
        })
        .join('') ||
      `<p style="margin:0;font-size:14px;color:#6b7280;">No hay items en este pedido.</p>`;

    const shipping = this.renderAddressBlock(
      'Dirección de envío',
      order.shippingAddress,
    );
    const billing = this.renderBillingBlock(
      'Facturación',
      order.billingProfile,
    );

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:24px;color:#0f172a;">
      <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">

        <!-- ENCABEZADO (igual al front en lógica) -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <p style="margin:0;font-size:13px;color:#6b7280;">
              ${order.orderNumber ?? order.id}
            </p>
            <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#111827;">
              ${status}
            </p>
            <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">
              ${createdAt}
            </p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">
              ${currency}
            </p>
          </div>
        </div>

        <div
          style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
            gap:16px;
          "
        >
          ${shipping}
          ${billing}
        </div>

        <div style="padding:20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">
            Productos
          </p>

          ${itemsRows}

          <div style="text-align:right;font-size:16px;font-weight:700;margin-top:12px;color:#111827;">
            Total: ${currency}
          </div>
        </div>

        <div
          style="
            margin-top:8px;
            padding:14px 16px;
            background:#0ea5e9;
            color:#ffffff;
            text-align:center;
            border-radius:12px;
            font-size:14px;
            font-weight:600;
          "
        >
          ¡Gracias por tu compra, ${user.fullName ?? user.email}!
        </div>

      </div>
    </div>
    `;

    await this.mailService.send({
      to: user.email,
      subject: `Confirmación de pedido ${order.orderNumber}`,
      html,
    });
  }


  private renderAddressBlock(title: string, address?: Record<string, any> | null) {
    if (!address) {
      return `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;background:#f9fafb;color:#6b7280;">${title}: No provisto</div>`;
    }

    const lines = [
      address.fullName,
      address.phone,
      [address.street, address.apartment].filter(Boolean).join(' '),
      [address.city, address.state, address.country].filter(Boolean).join(', '),
      address.postalCode,
      address.notes,
    ]
      .filter(Boolean)
      .map((line) => `<div style="line-height:1.5;">${line}</div>`)
      .join('');

    return `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;background:#f9fafb;">
        <div style="font-weight:700;color:#0f172a;margin-bottom:6px;">${title}</div>
        <div style="color:#374151;font-size:13px;">${lines}</div>
      </div>
    `;
  }

  private renderBillingBlock(title: string, billing?: Record<string, any> | null) {
    if (!billing) {
      return this.renderAddressBlock(title, null);
    }

    const lines = [
      billing.legalName ?? billing.fullName,
      billing.taxId ? `RUC: ${billing.taxId}` : null,
      [billing.email, billing.phone].filter(Boolean).join(' · '),
      [billing.addressLine1, billing.addressLine2].filter(Boolean).join(', '),
      [billing.city, billing.state, billing.country].filter(Boolean).join(', '),
      billing.postalCode,
    ]
      .filter(Boolean)
      .map((line) => `<div style="line-height:1.5;">${line}</div>`)
      .join('');

    return `
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;background:#f9fafb;">
        <div style="font-weight:700;color:#0f172a;margin-bottom:6px;">${title}</div>
        <div style="color:#374151;font-size:13px;">${lines}</div>
      </div>
    `;
  }

  private formatCurrency(amount: number | null | undefined) {
    if (amount === null || amount === undefined) return 'Gs. 0';
    return `Gs. ${new Intl.NumberFormat('es-PY').format(amount)}`;
  }

  private formatDateToParaguay(value?: Date | string | null): string | undefined {
    if (!value) return undefined;
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString('es-PY', { timeZone: 'America/Asuncion' });
  }
}
