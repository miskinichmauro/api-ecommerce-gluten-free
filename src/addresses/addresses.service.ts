import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(user: User) {
    return this.addressRepository.find({
      where: { user: { id: user.id } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(user: User, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      await this.clearDefault(user.id);
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
      isDefault: createAddressDto.isDefault ?? false,
    });

    return this.addressRepository.save(address);
  }

  async update(user: User, id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOwned(user.id, id);

    if (updateAddressDto.isDefault) {
      await this.clearDefault(user.id, id);
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(user: User, id: string) {
    const address = await this.findOwned(user.id, id);
    await this.orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ shippingAddress: null })
      .where('shippingAddressId = :id', { id })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();
    await this.addressRepository.remove(address);
  }

  private async findOwned(userId: string, id: string) {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException({
        message: 'Dirección no encontrada',
        code: 'ADDRESS_NOT_FOUND',
        expose: true,
      });
    }

    return address;
  }

  private async clearDefault(userId: string, exceptId?: string) {
    const query = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId });

    if (exceptId) {
      query.andWhere('id != :exceptId', { exceptId });
    }

    await query.execute();
  }
}
