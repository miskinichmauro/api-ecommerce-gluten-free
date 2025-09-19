import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto
 {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d\W])(?![.\n]).+$/, 
        {
            message: 'La contraseña debe tener una letra mayúscula, una minúscula y un número.'
        }
    )
    password: string;
}
