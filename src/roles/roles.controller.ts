import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Auth } from 'src/auth/decorators';
import { Roles as Role } from 'src/auth/enums/role.enum';
import { ApiOperation } from '@nestjs/swagger';

@Controller('roles')
@Auth(Role.admin)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crea un nuevo rol',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Devuelve todos los roles',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Devuelve un rol por su id',
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualiza un rol por su id',
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactiva un rol por su id',
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
