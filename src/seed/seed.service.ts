import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from 'src/auth/auth.service';
import { ProductsService } from 'src/products/products.service';
import { initialProducts, initialUsers } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
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
    const user = await this.authService.findOne(emailAdmin);

    await Promise.all(this.insertProducts(user));

    return 'Seed Execute';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    await this.authService.deleteAllUsers();
  }

  private insertProducts(user: User) {
    return initialProducts.map((product) =>
      this.productsService.create(product, user),
    );
  }

  private insertUsers() {
    return initialUsers.map((user) => this.authService.create(user));
  }
}
