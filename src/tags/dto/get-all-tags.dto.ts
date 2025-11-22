import { IsOptional, IsUUID } from 'class-validator';

export class GetAllTagsDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
