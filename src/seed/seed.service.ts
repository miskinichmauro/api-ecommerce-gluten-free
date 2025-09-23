import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from 'src/auth/auth.service';
import { ProductsService } from 'src/products/products.service';
import { initialProducts, initialUsers } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor (
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService
  ) { }

  async executeSeed() {
    const environment = this.configService.get<string>('NODE_ENV') ?? 'development';
    if (environment !== 'development') {
      throw new ForbiddenException('Endpoint ejecutable solo en ambiente de pruebas');
    }

    await this.deleteTables();

    await Promise.all(
      this.insertUsers()
    );
    
    const emailAdmin = initialUsers[0].email;
    const user = await this.authService.findOne(emailAdmin);

    await Promise.all(
      this.insertProducts(user)
    );

    return 'Seed Execute';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    await this.authService.deleteAllUsers();
  }

  private insertProducts(user: User) {
    return initialProducts.map(product =>
      this.productsService.create(product, user),
    )
  }

  private insertUsers() {
    return initialUsers.map(user => 
      this.authService.create(user)
    )
  }
}
