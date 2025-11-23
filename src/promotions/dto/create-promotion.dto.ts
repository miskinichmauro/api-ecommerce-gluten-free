import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsUrl()
  redirectUrl: string;

  @IsInt()
  @Min(0)
  priority: number;
}
