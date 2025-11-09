import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SearchProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  query?: string;
}
