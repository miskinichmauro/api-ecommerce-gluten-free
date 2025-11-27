import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @ApiProperty({ example: '+595981234567' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Av. Espana 1234' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  street: string;

  @ApiProperty({ example: 'Depto 5A', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  apartment?: string;

  @ApiProperty({ example: 'Asuncion' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  city: string;

  @ApiProperty({ example: 'Central', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  state?: string;

  @ApiProperty({ example: 'Paraguay' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  country: string;

  @ApiProperty({ example: '1209', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: 'Timbre roto', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  notes?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
