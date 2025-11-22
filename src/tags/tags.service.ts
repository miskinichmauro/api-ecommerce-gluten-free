import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetAllTagsDto } from './dto/get-all-tags.dto';

@Injectable()
export class TagsService {
  private readonly logger = new Logger('TagsService');

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    try {
      const tag = this.tagRepository.create(createTagDto);
      await this.tagRepository.save(tag);
      return tag;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(query?: GetAllTagsDto): Promise<Tag[]> {
    const { categoryId } = query ?? {};

    if (categoryId) {
      return await this.tagRepository
        .createQueryBuilder('tag')
        .leftJoin('tag.products', 'product')
        .where('product.categoryId = :categoryId', { categoryId })
        .distinct(true)
        .orderBy('tag.name', 'ASC')
        .getMany();
    }

    return await this.tagRepository.find({
      order: { name: 'ASC' },
      relations: ['products'],
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!tag) {
      throw new NotFoundException(`No se encontró el tag con id: '${id}'`);
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.preload({
      id,
      ...updateTagDto,
    });

    if (!tag) {
      throw new NotFoundException(`No se encontró el tag con id: '${id}'`);
    }

    try {
      await this.tagRepository.save(tag);
      return tag;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return { message: `Tag eliminado: ${tag.name}` };
  }

  async removeAll() {
    await this.tagRepository.createQueryBuilder().delete().where({}).execute();
  }

  private handleDBException(error: any): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string; detail?: string };
      if (err.code === '23505') {
        throw new BadRequestException(err.detail);
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado en TagsService');
  }
}
