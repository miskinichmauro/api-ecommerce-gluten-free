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

type RankedRecipe = Recipe & { matchCount: number; matchedIngredientNames: string[] };
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
    if (!recipe)
      throw new NotFoundException({
        message: `Receta con id ${id} no encontrada`,
        code: 'RECIPE_NOT_FOUND',
        expose: true,
      });
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

    const normalizedSegments = this.extractNormalizedSegments(rawIngredients);
    if (!normalizedSegments.length) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const ingredients = await this.ingredientRepository.find();
    const matchedIngredients = ingredients.filter((ingredient) =>
      this.matchesAnySegment(ingredient, normalizedSegments),
    );

    const ingredientIds = matchedIngredients.map((ingredient) => ingredient.id);
    if (!ingredientIds.length) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const matchedIngredientNameById = new Map(
      matchedIngredients.map((ingredient) => [ingredient.id, ingredient.name]),
    );

    const fullMatches = await this.findRecipesMatchingAll(ingredientIds);
    const fullMatchesWithCount: RankedRecipe[] = fullMatches.map((recipe) => ({
      ...recipe,
      matchCount: ingredientIds.length,
      matchedIngredientNames: this.buildMatchedIngredientNames(
        recipe,
        matchedIngredientNameById,
      ),
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
        matchedIngredientNames: this.buildMatchedIngredientNames(
          recipe,
          matchedIngredientNameById,
        ),
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
      throw new BadRequestException({
        message: 'Uno o más ingredientes no existen',
        code: 'RECIPE_INGREDIENT_NOT_FOUND',
        expose: true,
      });
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

  private extractNormalizedSegments(raw?: string) {
    if (!raw) return [];
    const segments = raw
      .split(',')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .map((segment) => this.normalizeForComparison(this.cleanSegment(segment)))
      .filter((segment) => segment.length >= 3);

    return Array.from(new Set(segments));
  }

  private cleanSegment(segment: string) {
    return segment
      .replace(/\d+/g, ' ')
      .replace(/[^\p{L}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeForComparison(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private matchesAnySegment(ingredient: Ingredient, segments: string[]) {
    const normalizedIngredient = this.normalizeForComparison(ingredient.name);
    const tokens = normalizedIngredient
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);

    return segments.some((segment) => {
      if (segment.includes(normalizedIngredient) || normalizedIngredient.includes(segment)) {
        return true;
      }

      if (
        tokens.some(
          (token) => token.includes(segment) || segment.includes(token),
        )
      ) {
        return true;
      }

      return false;
    });
  }

  private buildMatchedIngredientNames(
    recipe: Recipe,
    matchedIngredients: Map<string, string>,
  ) {
    const names =
      recipe.recipeIngredients
        ?.map((ri) => matchedIngredients.get(ri.ingredientId))
        .filter((name): name is string => typeof name === 'string') ?? [];

    return Array.from(new Set(names));
  }
}
