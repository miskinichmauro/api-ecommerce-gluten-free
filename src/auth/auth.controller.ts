import { Controller, Post, Body, Get, Query, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { GetUser } from './decorators';
import { Auth } from './decorators/auth.decorator';
import { Role } from './enums/role.enum';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Permite añadir un nuevo usuario'
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
     return await this.authService.create(createUserDto);
    } catch (error) {
      this.authService.handleDbErrorExceptions(error);
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Genera un token para el usuario'
  })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Devuelve todos los usuarios paginado'
  })
  @Auth(Role.admin)
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.authService.getAll(paginationDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactiva un usuario por Id'
  })
  @Auth(Role.admin)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.authService.delete(id);
  }

  @Get('check-status')
  @ApiOperation({
    summary: 'Regenera el token de un usuario'
  })
  @Auth()
  checkStatus(
    @GetUser() user: User) {
      return this.authService.checkStatus(user);
  }
}
