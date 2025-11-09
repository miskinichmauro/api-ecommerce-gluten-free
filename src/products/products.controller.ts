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
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAllProductsDto } from './dto/get-all-products';
import { ProductsListQueryDto } from './dto/products-list-query.dto';
import { Roles } from 'src/auth/enums/role.enum';
import { SearchProductsDto } from 'src/common/dto/searchProducts.dto';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(Roles.Admin)
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
  async findAll(@Query() getAllProductsDto: GetAllProductsDto) {
    const isFeatured = getAllProductsDto.isFeatured === 'true';
    return await this.productsService.findAll(getAllProductsDto, isFeatured);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Búsqueda de productos',
  })
  async search(@Query() query: SearchProductsDto) {
    return this.productsService.searchProducts(query);
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
  async findByTags(@Param('tag') tag: string, @Query() paginationDto: ProductsListQueryDto) {
    try {
      return await this.productsService.findByTag(tag, paginationDto);
    } catch (error) {
      this.productsService.handleException(error);
    }
  }

  @Patch(':id')
  @Auth(Roles.Admin)
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
  @Auth(Roles.Admin)
  @ApiOperation({
    summary: 'Inactiva un producto por Id',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
