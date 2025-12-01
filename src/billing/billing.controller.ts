import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { BillingService } from './billing.service';
import { CreateBillingProfileDto } from './dto/create-billing-profile.dto';
import { UpdateBillingProfileDto } from './dto/update-billing-profile.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Account - Facturacion')
@Controller('account/billing')
@Auth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los datos de facturacion del usuario' })
  findAll(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.billingService.findAll(user, paginationDto);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un dato de facturacion' })
  create(
    @GetUser() user: User,
    @Body() createBillingProfileDto: CreateBillingProfileDto,
  ) {
    return this.billingService.create(user, createBillingProfileDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un dato de facturacion' })
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateBillingProfileDto: UpdateBillingProfileDto,
  ) {
    return this.billingService.update(user, id, updateBillingProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un dato de facturacion' })
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.billingService.remove(user, id);
  }
}
