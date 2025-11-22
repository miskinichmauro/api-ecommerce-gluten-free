import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ProductsListQueryDto } from './products-list-query.dto';

export class GetAllProductsDto extends ProductsListQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v): v is string => v.length > 0);
    }
    if (Array.isArray(value)) {
      return (value as unknown[])
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v): v is string => typeof v === 'string' && v.length > 0);
    }
    return undefined;
  })
  @IsArray()
  @IsUUID(4, { each: true })
  tagIds?: string[];
}
