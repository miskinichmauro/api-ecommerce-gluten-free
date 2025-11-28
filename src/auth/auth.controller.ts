import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { GetUser } from './decorators';
import { Auth } from './decorators/auth.decorator';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Permite añadir un nuevo usuario',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Genera un token para el usuario',
  })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @ApiOperation({
    summary: 'Regenera el token de un usuario',
  })
  @Auth()
  checkStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }
}
