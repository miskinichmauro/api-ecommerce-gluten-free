import {
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d\W])(?![.\n]).+$/, {
    message:
      'La contraseña debe tener una letra mayúscula, una minúscula y un número.',
  })
  password: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];
}
