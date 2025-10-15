import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from 'src/auth/auth.service';
import { ProductsService } from 'src/products/products.service';
import { initialContacts, initialProducts, initialRecipes, initialUsers } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { ContactsService } from 'src/contacts/contacts.service';
import { RecipesService } from 'src/recipes/recipes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly contactService: ContactsService,
    private readonly recipeService: RecipesService
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

    await Promise.all(this.insertUsers());

    const emailAdmin = initialUsers[0].email;
    const user = await this.userService.findOne(emailAdmin);

    await Promise.all([
      this.insertProducts(user),
      this.insertContacts(),
      this.insertRecipes()
    ]);

    return 'Seed Execute';
  }

  private async deleteTables() {
    await Promise.all([
      this.productsService.deleteAllProducts(),
      this.userService.deleteAllUsers(),
      this.contactService.deleteAllContacts(),
      this.recipeService.deleteAllRecipes(),
    ]);
  }

  private insertProducts(user: User) {
    return initialProducts.map((product) =>
      this.productsService.create(product, user),
    );
  }

  private insertUsers() {
    return initialUsers.map((user) => this.authService.create(user));
  }

  private insertContacts() {
    return initialContacts.map((contact) => this.contactService.create(contact));
  }

  private insertRecipes() {
    return initialRecipes.map((recipe) => this.recipeService.create(recipe));
  }

}
