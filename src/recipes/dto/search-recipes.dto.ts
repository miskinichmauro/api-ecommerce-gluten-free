import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchRecipesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  q?: string;
}
