import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBillingProfileDto } from './dto/create-billing-profile.dto';
import { UpdateBillingProfileDto } from './dto/update-billing-profile.dto';
import { BillingProfile } from './entities/billing-profile.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(BillingProfile)
    private readonly billingRepository: Repository<BillingProfile>,
  ) {}

  async findAll(user: User) {
    return this.billingRepository.find({
      where: { user: { id: user.id } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(user: User, dto: CreateBillingProfileDto) {
    if (dto.isDefault) {
      await this.clearDefault(user.id);
    }

    const profile = this.billingRepository.create({
      ...dto,
      user,
      isDefault: dto.isDefault ?? false,
    });

    return this.billingRepository.save(profile);
  }

  async update(user: User, id: string, dto: UpdateBillingProfileDto) {
    const profile = await this.findOwned(user.id, id);

    if (dto.isDefault) {
      await this.clearDefault(user.id, id);
    }

    Object.assign(profile, dto);
    return this.billingRepository.save(profile);
  }

  async remove(user: User, id: string) {
    const profile = await this.findOwned(user.id, id);
    await this.billingRepository.remove(profile);
  }

  private async findOwned(userId: string, id: string) {
    const profile = await this.billingRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Dato de facturacion no encontrado');
    }

    return profile;
  }

  private async clearDefault(userId: string, exceptId?: string) {
    const query = this.billingRepository
      .createQueryBuilder()
      .update(BillingProfile)
      .set({ isDefault: false })
      .where('userId = :userId', { userId });

    if (exceptId) {
      query.andWhere('id != :exceptId', { exceptId });
    }

    await query.execute();
  }
}
