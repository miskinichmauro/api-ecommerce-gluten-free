import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');
  private readonly MAX_FEATURED = 4;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      await this.ensureFeaturedLimit(createCategoryDto.isFeatured);
      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
      relations: ['products'],
    });
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException({
        message: `No se encontró la categoría con id: '${id}'`,
        code: 'CATEGORY_NOT_FOUND',
        expose: true,
      });
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });

    if (!category) {
      throw new NotFoundException({
        message: `No se encontró la categoría con id: '${id}'`,
        code: 'CATEGORY_NOT_FOUND',
        expose: true,
      });
    }

    try {
      await this.ensureFeaturedLimit(category.isFeatured, id);
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: `Categoría eliminada: ${category.name}` };
  }

  async removeAll() {
    await this.categoryRepository.createQueryBuilder().delete().where({}).execute();
  }

  private handleDBException(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string; detail?: string };
      if (err.code === '23505') {
        throw new BadRequestException({
          message: err.detail ?? 'La categoría ya existe',
          code: 'CATEGORY_CONFLICT',
          expose: true,
        });
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException({
      message: 'Error inesperado en CategoriesService',
      code: 'CATEGORY_UNEXPECTED_ERROR',
      expose: false,
    });
  }

  private async ensureFeaturedLimit(isFeatured: boolean, currentId?: string) {
    if (!isFeatured) {
      return;
    }

    const featuredCount = await this.categoryRepository.count({
      where: {
        isFeatured: true,
        ...(currentId ? { id: Not(currentId) } : {}),
      },
    });

    if (featuredCount >= this.MAX_FEATURED) {
      throw new BadRequestException({
        message: `Solo se permiten ${this.MAX_FEATURED} categorías destacadas. Desmarca otra antes de crear o actualizar una nueva.`,
        code: 'CATEGORY_FEATURED_LIMIT',
        expose: true,
      });
    }
  }
}
