import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUId } from 'uuid';

import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductImage } from './entities';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly fileService: FilesService,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { imagesName = [], ...productDetails } = createProductDto;
    const newProduct = this.productRepository.create({
      ...productDetails,
      imagesName: imagesName.map((url) =>
        this.productImageRepository.create({ url }),
      ),
      user,
    });

    if (newProduct.imagesName) {
      this.validateImages(newProduct.imagesName);
    }

    await this.productRepository.save(newProduct);
    return { ...newProduct, imagesName };
  }

  private validateImages(images: ProductImage[]) {
    let imagesDontExists: string[] = [];
    images?.forEach((item) => {
      try {
        this.fileService.findOne(item.url);
      } catch (error) {
        console.log(error);
        if (error?.status === HttpStatus.NOT_FOUND) {
          imagesDontExists.push(item.url);
        } else {
          throw error;
        }
      }
    });

    if (imagesDontExists.length > 0) {
      throw new NotFoundException(
        `No se pudo guardar el producto. Por favor, verifique que las imágenes estén correctamente cargadas: 
        ${imagesDontExists.join(', ')}`,
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        imagesName: true,
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.imagesName?.map((image) => image.url),
    }));
  }

  async findOne(param: string) {
    let product: Product | null;

    if (isUUId(param)) {
      product = await this.productRepository.findOneBy({ id: param });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('LOWER(title) = LOWER(:title) or slug = LOWER(:slug)', {
          title: param,
          slug: param,
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
      images: product.imagesName?.map((img) => img.url),
    };
  }

  async findByTag(tag: string, paginationDto: PaginationDto) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    const products = await queryBuilder
      .where('LOWER(:tag) = ANY(tags)', { tag })
      .leftJoinAndSelect('product.images', 'productImages')
      .limit(paginationDto.limit)
      .offset(paginationDto.offset)
      .getMany();

    if (products.length == 0)
      throw new NotFoundException(
        `No se encontraron productos con el tag '${tag}'`,
      );
    return products;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { imagesName, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) {
      throw new NotFoundException(`No se encontró el producto con id: '${id}'`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (imagesName) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.imagesName = imagesName.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      product.user = user;
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
    await this.productRepository.softRemove(product);
  }

  handleException(error: any) {
    if (error?.status == HttpStatus.NOT_FOUND) throw error;

    this.logger.error(error);

    this.handleDBException(error);
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado. Por favor, verifique los logs',
    );
  }

  handleDBException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
