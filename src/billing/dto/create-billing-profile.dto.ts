import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBillingProfileDto {
  @ApiProperty({ example: 'Empresa Paraguay SA' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  legalName: string;

  @ApiProperty({ example: '80012345-6' })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  taxId: string;

  @ApiProperty({ example: 'facturacion@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+595981234567', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Av. Espana 1234' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  addressLine1: string;

  @ApiProperty({ example: 'Piso 5', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  addressLine2?: string;

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

  @ApiProperty({ example: '1425', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
