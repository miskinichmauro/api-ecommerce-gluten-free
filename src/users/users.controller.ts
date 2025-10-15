import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  @ApiOperation({
    summary: 'Devuelve todos los usuarios paginado',
  })
  @Auth(Role.admin)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Devuelve un usuario por id',
  })
  @Auth(Role.admin)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualiza un usuario',
  })
  @Auth(Role.admin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactiva un usuario por Id',
  })
  @Auth(Role.admin)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
