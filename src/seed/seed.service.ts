import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialProducts } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor (
    private readonly productsService: ProductsService
  ) { }

  async executeSeed() {
    await this.productsService.deleteAllProducts();

    await Promise.all(
      initialProducts.map(product =>
        this.productsService.create(product),
      ),
    );
    return 'Seed Execute';
  }
}
