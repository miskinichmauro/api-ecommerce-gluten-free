import { IsOptional, IsString } from 'class-validator';
import { ProductsListQueryDto } from 'src/products/dto/products-list-query.dto';

export class SearchProductsDto extends ProductsListQueryDto {
  @IsOptional()
  @IsString()
  query?: string;
}
