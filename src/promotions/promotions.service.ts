import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion } from './entities/promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const promotion = this.promotionRepository.create(createPromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async findAll() {
    return this.promotionRepository.find({
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const promotion = await this.promotionRepository.findOneBy({ id });
    if (!promotion) {
      throw new NotFoundException(`Promoción con id ${id} no encontrada`);
    }
    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updatePromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: string) {
    const promotion = await this.findOne(id);
    return this.promotionRepository.remove(promotion);
  }

  async removeAll() {
    await this.promotionRepository.createQueryBuilder().delete().where({}).execute();
  }
}
