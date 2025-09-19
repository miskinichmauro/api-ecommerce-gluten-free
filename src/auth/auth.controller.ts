import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from './decorators/auth.decorator';
import { Role } from './enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
     return await this.authService.create(createUserDto);
    } catch (error) {
      this.authService.handleDbErrors(error);
    }
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('users')
  @Auth(Role.admin)
  async getAll(@Query() paginationDto: PaginationDto) {
    return await this.authService.getAll(paginationDto);
  }
}
