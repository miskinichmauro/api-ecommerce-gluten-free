import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export type ProductSortBy = 'title' | 'price' | 'stock' | 'slug' | 'isFeatured';
export type SortOrder = 'ASC' | 'DESC';

export class ProductsListQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['title', 'price', 'stock', 'slug', 'isFeatured'])
  sortBy?: ProductSortBy;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: SortOrder;
}

