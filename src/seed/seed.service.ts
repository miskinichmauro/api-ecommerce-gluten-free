import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from 'src/auth/auth.service';
import { ProductsService } from 'src/products/products.service';
import {
  initialCategories,
  initialContacts,
  initialProducts,
  initialRecipes,
  initialRoles,
  initialTags,
  initialUsers,
} from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { ContactsService } from 'src/contacts/contacts.service';
import { RecipesService } from 'src/recipes/recipes.service';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { CategoriesService } from 'src/categories/categories.service';
import { TagsService } from 'src/tags/tags.service';
import { IngredientsService } from 'src/ingredients/ingredients.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly contactService: ContactsService,
    private readonly recipeService: RecipesService,
    private readonly rolesService: RolesService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async executeSeed(apiKey: string) {
    const apiKeyEnv = this.configService.get<string>('API_KEY');
    if (!apiKeyEnv) {
      throw new UnauthorizedException(
        'Falta una variable necesaria (API_KEY) para la ejecución del SEED',
      );
    }

    if (!apiKey) {
      throw new UnauthorizedException('Debe enviar una API Key en los headers');
    }

    if (apiKey !== apiKeyEnv) {
      throw new ForbiddenException(
        'API Key inválida o sin permisos para ejecutar este endpoint',
      );
    }

    await this.deleteTables();

    await this.insertUsers();

    const emailAdmin = initialUsers[0].email;
    const user = await this.userService.findOne(emailAdmin);

    const [categories, tags] = await Promise.all([
      this.insertCategories(),
      this.insertTags(),
    ]);

    const categoriesMap = new Map(categories.map((category) => [category.name, category.id]));
    const tagsMap = new Map(tags.map((tag) => [tag.name, tag.id]));

    await Promise.all([
      this.insertProducts(user, categoriesMap, tagsMap),
      this.insertContacts(),
      this.insertRecipes(),
      this.insertRoles(),
    ]);

    return 'Seed Execute';
  }

  private async deleteTables() {
    await this.productsService.removeAll();
    await this.contactService.removeAll();
    await this.recipeService.removeAll();
    await this.userService.removeAll();
    await this.rolesService.removeAll();
    await this.tagsService.removeAll();
    await this.categoriesService.removeAll();
    await this.ingredientsService.removeAll();
  }

  private insertCategories() {
    return Promise.all(
      initialCategories.map((category) => this.categoriesService.create(category)),
    );
  }

  private insertTags() {
    return Promise.all(
      initialTags.map((tag) => this.tagsService.create(tag)),
    );
  }

  private insertProducts(
    user: User,
    categoriesMap: Map<string, string>,
    tagsMap: Map<string, string>,
  ) {
    return Promise.all(
      initialProducts.map(({ categoryName, tagNames = [], ...product }) => {
        const categoryId = categoriesMap.get(categoryName);
        if (!categoryId) {
          throw new NotFoundException(
            `No se encontro la categoria '${categoryName}' para el producto '${product.title}'`,
          );
        }

        const tagIds = tagNames.map((tagName) => {
          const tagId = tagsMap.get(tagName);
          if (!tagId) {
            throw new NotFoundException(
              `No se encontro el tag '${tagName}' para el producto '${product.title}'`,
            );
          }
          return tagId;
        });

        return this.productsService.create(
          {
            ...product,
            categoryId,
            tagIds,
          },
          user,
        );
      }),
    );
  }

  private insertUsers() {
    return Promise.all(
      initialUsers.map((user) => this.authService.create(user)),
    );
  }

  private insertContacts() {
    return Promise.all(
      initialContacts.map((contact) => this.contactService.create(contact)),
    );
  }

  private insertRecipes() {
    return Promise.all(
      initialRecipes.map((recipe) => this.recipeService.create(recipe)),
    );
  }

  private insertRoles() {
    return Promise.all(
      initialRoles.map((role) => this.rolesService.create(role)),
    );
  }
}
