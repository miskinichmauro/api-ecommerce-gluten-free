import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUId } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductDto);
    await this.productRepository.save(newProduct);
    return newProduct;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(param: string) {
    let product: Product | null;

    if (isUUId(param)) {
      product = await this.productRepository.findOneBy({id: param});
    }
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:title) or slug = LOWER(:slug)', {
          title: param,
          slug: param
        })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`No se encontró el producto: '${param}'`);
    }
    return product;
  }

  async findByTag(tag: string) {
    const queryBuilder = this.productRepository.createQueryBuilder();
    const products = await queryBuilder
      .where("LOWER(:tag) = ANY(tags)", { tag })
      .getMany();

    if (products.length == 0)
      throw new NotFoundException(`No se encontraron productos con el tag '${tag}'`);
    return products;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if (!product){
      throw new NotFoundException(`No se encontró el producto con id: '${id}'`);
    }

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);    
    await this.productRepository.remove(product);
  }

  handleException(error: any) {
    if (error?.status == HttpStatus.NOT_FOUND)
      throw error;
    
    this.logger.error(error);

    this.handleDBException(error);
    throw new InternalServerErrorException('Ocurrió un error inesperado. Por favor, verifique los logs');
  }

  handleDBException(error: any) {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);
  }
}
