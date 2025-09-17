import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUId } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productDetails } = createProductDto;
    const newProduct = this.productRepository.create({
      ...productDetails,
      images: images.map( url => this.productImageRepository.create({ url }))
    });
    await this.productRepository.save(newProduct);
    return { ...newProduct, images };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images?.map(image => image.url)
    }))
  }

  async findOne(param: string) {
    let product: Product | null;

    if (isUUId(param)) {
      product = await this.productRepository.findOneBy({id: param});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:title) or slug = LOWER(:slug)', {
          title: param,
          slug: param
        })
        .leftJoinAndSelect('product.images', 'productImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`No se encontró el producto: '${param}'`);
    }
    return product;
  }

  async findOnePlain(param: string) {
    const product = await this.findOne(param);

    return {
      ...product,
      images: product.images?.map(img => img.url)
    }
  }

  async findByTag(tag: string) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    const products = await queryBuilder
      .where("LOWER(:tag) = ANY(tags)", { tag })
        .leftJoinAndSelect('product.images', 'productImages')
      .getMany();

    if (products.length == 0)
      throw new NotFoundException(`No se encontraron productos con el tag '${tag}'`);
    return products;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id,...toUpdate });

    if (!product){
      throw new NotFoundException(`No se encontró el producto con id: '${id}'`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: { id }});
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch {
      await queryRunner.rollbackTransaction();
    }

    return this.findOnePlain(id);
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
