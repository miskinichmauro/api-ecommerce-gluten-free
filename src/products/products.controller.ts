import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';

@Controller('products')
@Auth()
export class ProductsController {  
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    try {
      return await this.productsService.create(createProductDto, user)
    } catch (error) {
      this.productsService.handleException(error);
    }
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @Get(':param')
  async findOne(@Param('param') param: string) {
    return await this.productsService.findOnePlain(param);
  }

  @Get('tags/:tag')
  async findByTags(@Param('tag') tag: string) {
    try {
      return await this.productsService.findByTag(tag);
    } catch (error) {
      this.productsService.handleException(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User) {
    return await this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
