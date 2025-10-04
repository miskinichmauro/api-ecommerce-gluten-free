import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsPhoneNumber('PY', { message: 'Debe ser un teléfono válido de Paraguay' })
  phone: string;

  @IsEmail()
  email: string;
}
