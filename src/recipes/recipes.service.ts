import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { SearchRecipesDto } from './dto/search-recipes.dto';

type RankedRecipe = Recipe & { matchCount: number; matchedIngredientNames: string[] };

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

  async searchRecipes(searchRecipesDto: SearchRecipesDto) {
    const { q, limit = 10, offset = 0 } = searchRecipesDto;
    const safeLimit = Math.min(Math.max(limit ?? 10, 1), 100);
    const safeOffset = Math.max(offset ?? 0, 0);

    const searchTerms = this.buildSearchTerms(q);
    if (!searchTerms.length) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const patterns = searchTerms.map((term) => `%${term}%`);

    const countQuery = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoin('recipe.recipeIngredients', 'ri')
      .leftJoin('ri.ingredient', 'ingredient');
    this.applySearchFilters(countQuery);
    const totalRaw = await countQuery
      .select('COUNT(DISTINCT recipe.id)', 'total')
      .setParameter('patterns', patterns)
      .getRawOne<{ total: string }>();
    const totalMatches = Number(totalRaw?.total ?? 0);
    if (!totalMatches) {
      return { count: 0, pages: 0, recipes: [] };
    }

    const textMatchExpr = `MAX(CASE WHEN unaccent(recipe.text) ILIKE ANY (:patterns) THEN 1 ELSE 0 END)`;
    const titleMatchExpr = `MAX(CASE WHEN unaccent(recipe.title) ILIKE ANY (:patterns) THEN 1 ELSE 0 END)`;
    const ingredientMatchExpr = `COUNT(DISTINCT CASE WHEN unaccent(ingredient.name) ILIKE ANY (:patterns) THEN ingredient.id END)`;
    const matchCountExpr = `${textMatchExpr} + ${titleMatchExpr} + ${ingredientMatchExpr}`;

    const matchQuery = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoin('recipe.recipeIngredients', 'ri')
      .leftJoin('ri.ingredient', 'ingredient');
    this.applySearchFilters(matchQuery);

    const rawMatches = await matchQuery
      .select('recipe.id', 'id')
      .addSelect(matchCountExpr, 'match_count')
      .groupBy('recipe.id')
      .orderBy('match_count', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC')
      .limit(safeLimit)
      .offset(safeOffset)
      .setParameter('patterns', patterns)
      .getRawMany<{ id: string; matchCount: string }>();

    const pages = Math.ceil(totalMatches / safeLimit);
    if (!rawMatches.length) {
      return { count: totalMatches, pages, recipes: [] };
    }

    const recipeIds = rawMatches.map((raw) => raw.id);
    const recipes = await this.recipeRepository.find({
      where: { id: In(recipeIds) },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });

    const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
    const orderedRecipes: RankedRecipe[] = rawMatches
      .map((raw) => {
        const recipe = recipeMap.get(raw.id);
        if (!recipe) return null;
        return {
          ...recipe,
          matchCount: Number(raw.matchCount),
          matchedIngredientNames: this.buildMatchedIngredientNamesForSearch(
            recipe,
            searchTerms,
          ),
        };
      })
      .filter((recipe): recipe is RankedRecipe => Boolean(recipe));

    return { count: totalMatches, pages, recipes: orderedRecipes };
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

  private applySearchFilters(
    qb: SelectQueryBuilder<Recipe>,
  ): SelectQueryBuilder<Recipe> {
    return qb.where(
      new Brackets((qb) => {
        qb.where('unaccent(recipe.text) ILIKE ANY (:patterns)')
          .orWhere('unaccent(recipe.title) ILIKE ANY (:patterns)')
          .orWhere('unaccent(ingredient.name) ILIKE ANY (:patterns)');
      }),
    );
  }

  private buildSearchTerms(raw?: string) {
    if (!raw) return [];
    const cleaned = this.cleanSegment(raw);
    if (!cleaned) return [];
    const normalized = this.normalizeForComparison(cleaned);
    if (!normalized) return [];
    const terms = normalized
      .split(/\s+/)
      .filter((term) => term.length >= 3);

    return Array.from(new Set(terms));
  }

  private buildMatchedIngredientNamesForSearch(
    recipe: Recipe,
    searchTerms: string[],
  ) {
    const matches = new Set<string>();
    for (const recipeIngredient of recipe.recipeIngredients ?? []) {
      const ingredientName = recipeIngredient.ingredient?.name;
      if (!ingredientName) continue;
      const normalizedIngredient = this.normalizeForComparison(ingredientName);
      if (searchTerms.some((term) => normalizedIngredient.includes(term))) {
        matches.add(ingredientName);
      }
    }

    return Array.from(matches);
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
}
