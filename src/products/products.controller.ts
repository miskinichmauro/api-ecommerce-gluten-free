import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiOperation } from '@nestjs/swagger';

@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Permite añadir un nuevo producto',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    try {
      return await this.productsService.create(createProductDto, user);
    } catch (error) {
      this.productsService.handleException(error);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Devuelve todos los productos existentes paginados',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @Get(':param')
  @ApiOperation({
    summary: 'Devuelve un producto por Id o por Slug',
  })
  async findOne(@Param('param') param: string) {
    return await this.productsService.findOnePlain(param);
  }

  @Get('tags/:tag')
  @ApiOperation({
    summary: 'Devuelve todos los productos por Tag paginado',
  })
  async findByTags(@Param('tag') tag: string, paginationDto: PaginationDto) {
    try {
      return await this.productsService.findByTag(tag, paginationDto);
    } catch (error) {
      this.productsService.handleException(error);
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Permite actualizar un producto por Id',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return await this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactiva un producto por Id',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
