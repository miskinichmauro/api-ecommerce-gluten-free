import { IsOptional, IsBooleanString } from 'class-validator';
import { ProductsListQueryDto } from './products-list-query.dto';

export class GetAllProductsDto extends ProductsListQueryDto {
  @IsOptional()
  @IsBooleanString()
  isFeatured?: string;
}
