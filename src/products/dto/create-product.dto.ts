import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  unitOfMeasure: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  // Nuevo: IDs de archivos en Google Drive
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  imageIds?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  imagesName?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsUUID('4')
  @IsOptional()
  categoryId?: string;
}
