import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { SearchRecipesDto } from './dto/search-recipes.dto';

type RankedRecipe = Recipe & { matchCount: number };
type RawMatch = { id: string; matchCount: string | number };

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const { ingredientIds = [], ...rest } = createRecipeDto;
    const recipe = this.recipeRepository.create(rest);
    await this.recipeRepository.save(recipe);

    if (ingredientIds.length) {
      const ingredients = await this.findIngredientsByIds(ingredientIds);
      const recipeIngredients = ingredients.map((ingredient) =>
        this.recipeIngredientRepository.create({
          recipeId: recipe.id,
          ingredientId: ingredient.id,
        }),
      );
      await this.recipeIngredientRepository.save(recipeIngredients);
    }

    return this.findOne(recipe.id);
  }

  async findAll() {
    return this.recipeRepository.find({
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });
    if (!recipe) throw new NotFoundException(`Receta con id ${id} no encontrada`);
    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const { ingredientIds, ...rest } = updateRecipeDto;
    const recipe = await this.findOne(id);
    Object.assign(recipe, rest);
    await this.recipeRepository.save(recipe);

    if (ingredientIds !== undefined) {
      await this.recipeIngredientRepository.delete({ recipeId: id });
      if (ingredientIds.length) {
        const ingredients = await this.findIngredientsByIds(ingredientIds);
        const recipeIngredients = ingredients.map((ingredient) =>
          this.recipeIngredientRepository.create({
            recipeId: recipe.id,
            ingredientId: ingredient.id,
          }),
        );
        await this.recipeIngredientRepository.save(recipeIngredients);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const recipe = await this.findOne(id);
    return await this.recipeRepository.remove(recipe);
  }

  async removeAll() {
    await this.recipeIngredientRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.recipeRepository.createQueryBuilder('recipe').delete().where({}).execute();
  }

  async filterByIngredients(searchRecipesDto: SearchRecipesDto) {
    const { ingredients: rawIngredients, limit = 10, offset = 0 } = searchRecipesDto;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset ?? 0, 0);
    const normalized = rawIngredients
      ?.split(',')
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);

    if (!normalized || normalized.length === 0) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const ingredients = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(ingredient.name) IN (:...names)', { names: normalized })
      .getMany();

    const ingredientIds = ingredients.map((ingredient) => ingredient.id);

    if (!ingredientIds.length) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const fullMatches = await this.findRecipesMatchingAll(ingredientIds);
    const fullMatchesWithCount: RankedRecipe[] = fullMatches.map((recipe) => ({
      ...recipe,
      matchCount: ingredientIds.length,
    }));
    const fullMatchIds = new Set(fullMatches.map((recipe) => recipe.id));

    const partialRaw = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoin(RecipeIngredient, 'ri', 'ri.recipe_id = recipe.id')
      .where('ri.ingredient_id IN (:...ingredientIds)', { ingredientIds })
      .select('recipe.id', 'id')
      .addSelect('COUNT(DISTINCT ri.ingredient_id)', 'matchCount')
      .groupBy('recipe.id')
      .orderBy('"matchCount"', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC')
      .getRawMany<RawMatch>();

    const partialIds: string[] = partialRaw
      .filter((raw) => !fullMatchIds.has(raw.id))
      .map((raw) => raw.id);

    if (!partialIds.length) {
      const ordered = [...fullMatchesWithCount];
      const total = ordered.length;
      const recipes = ordered.slice(safeOffset, safeOffset + safeLimit);
      const pages = Math.ceil(total / safeLimit);
      return { count: total, pages, recipes };
    }

    const partialRecipes = await this.recipeRepository.find({
      where: { id: In(partialIds) },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });

    const matchCountMap = new Map<string, number>(
      partialRaw.map((raw) => [raw.id, Number(raw.matchCount)]),
    );

    const partialMatches: RankedRecipe[] = partialRecipes
      .map((recipe) => ({
        ...recipe,
        matchCount: matchCountMap.get(recipe.id) ?? 0,
      }))
      .sort((a, b) => (b.matchCount ?? 0) - (a.matchCount ?? 0));

    const ordered: RankedRecipe[] = [...fullMatchesWithCount, ...partialMatches];
    const total = ordered.length;
    const recipes = ordered.slice(safeOffset, safeOffset + safeLimit);
    const pages = Math.ceil(total / safeLimit);

    return { count: total, pages, recipes };
  }

  private async findIngredientsByIds(ingredientIds: string[]) {
    const uniqueIds = Array.from(new Set(ingredientIds));
    const found = await this.ingredientRepository.find({
      where: { id: In(uniqueIds) },
    });

    if (found.length !== uniqueIds.length) {
      throw new BadRequestException('Uno o mas ingredientes no existen');
    }

    return found;
  }

  private async findRecipesMatchingAll(ingredientIds: string[]) {
    const qb = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'ri')
      .leftJoinAndSelect('ri.ingredient', 'ingredient');

    const subQuery = qb
      .subQuery()
      .select('ri2.recipe_id')
      .from(RecipeIngredient, 'ri2')
      .where('ri2.ingredient_id IN (:...ingredientIds)')
      .groupBy('ri2.recipe_id')
      .having('COUNT(DISTINCT ri2.ingredient_id) = :ingredientCount')
      .getQuery();

    return qb
      .where(`recipe.id IN ${subQuery}`)
      .setParameters({ ingredientIds, ingredientCount: ingredientIds.length })
      .orderBy('recipe.createdAt', 'DESC')
      .getMany();
  }
}
