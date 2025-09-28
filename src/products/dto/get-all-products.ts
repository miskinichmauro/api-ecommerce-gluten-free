import { IsOptional, IsBooleanString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetAllProductsDto extends PaginationDto {
  @IsOptional()
  @IsBooleanString()
  isFeatured?: string;
}