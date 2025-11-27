import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Account')
@Controller('account')
@Auth()
export class AccountController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtiene el perfil del usuario autenticado' })
  getProfile(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Actualiza el perfil del usuario autenticado' })
  updateProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
