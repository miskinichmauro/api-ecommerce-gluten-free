import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger('IngredientsService');

  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    try {
      const ingredient = this.ingredientRepository.create(createIngredientDto);
      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll() {
    return this.ingredientRepository.find({ order: { name: 'ASC' } });
  }

  async search(query: string) {
    const term = query?.trim();
    if (!term) return [];
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(ingredient.name) LIKE :term', { term: `%${term.toLowerCase()}%` })
      .orderBy('ingredient.name', 'ASC')
      .limit(10)
      .getMany();
  }

  async findByNames(names: string[]) {
    if (!names.length) return [];
    return this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(ingredient.name) IN (:...names)', {
        names: names.map((name) => name.toLowerCase()),
      })
      .getMany();
  }

  async findOne(id: string) {
    const ingredient = await this.ingredientRepository.findOneBy({ id });
    if (!ingredient) {
      throw new NotFoundException({
        message: `Ingrediente con id ${id} no encontrado`,
        code: 'INGREDIENT_NOT_FOUND',
        expose: true,
      });
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.ingredientRepository.preload({
      id,
      ...updateIngredientDto,
    });

    if (!ingredient) {
      throw new NotFoundException({
        message: `Ingrediente con id ${id} no encontrado`,
        code: 'INGREDIENT_NOT_FOUND',
        expose: true,
      });
    }

    try {
      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    const ingredient = await this.findOne(id);
    await this.ingredientRepository.remove(ingredient);
    return { message: `Ingrediente eliminado: ${ingredient.name}` };
  }

  async removeAll() {
    await this.ingredientRepository.createQueryBuilder().delete().where({}).execute();
  }

  private handleDBException(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string; detail?: string };
      if (err.code === '23505') {
        throw new BadRequestException({
          message: err.detail ?? 'El ingrediente ya existe',
          code: 'INGREDIENT_CONFLICT',
          expose: true,
        });
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException({
      message: 'Error inesperado en IngredientsService',
      code: 'INGREDIENT_UNEXPECTED_ERROR',
      expose: false,
    });
  }
}
