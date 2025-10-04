import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;
  
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
