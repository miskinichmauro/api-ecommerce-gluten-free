import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressesService } from './addresses.service';

@ApiTags('Account - Direcciones')
@Controller('account/addresses')
@Auth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista las direcciones del usuario' })
  findAll(@GetUser() user: User) {
    return this.addressesService.findAll(user);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una nueva direccion' })
  create(@GetUser() user: User, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(user, createAddressDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza una direccion' })
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una direccion' })
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.addressesService.remove(user, id);
  }
}
