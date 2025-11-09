import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, In, Repository } from 'typeorm';
import { validate as isUUId } from 'uuid';

import { CreateProductDto, UpdateProductDto } from './dto';
import { GetAllProductsDto } from './dto/get-all-products';
import { ProductsListQueryDto } from './dto/products-list-query.dto';
import { ProductImage } from './entities';
import { Product } from './entities/product.entity';
import { SearchProductsDto } from 'src/common/dto/searchProducts.dto';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';
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
    const { imagesName = [], categoryId, tagIds = [], ...productDetails } = createProductDto;
    let category: Category | null = null;
    if (categoryId) {
      category = await this.dataSource.getRepository(Category).findOneBy({ id: categoryId });
      if (!category) {
        throw new NotFoundException(`No se encontró la categoría con id: ${categoryId}`);
      }
    }

    let tags: Tag[] | null = null;
    if (tagIds.length > 0) {
      tags = await this.dataSource.getRepository(Tag).findBy({ id: In(tagIds) });
      if (tags?.length !== tagIds.length) {
        throw new NotFoundException(`Algunos tags no existen en la base de datos.`);
      }
    }

    const newProduct = this.productRepository.create({
      ...productDetails,
      imagesName: imagesName.map((url) =>
        this.productImageRepository.create({ url }),
      ),
      user,
      category,
      tags,
    } as DeepPartial<Product>);

    if (newProduct.imagesName) {
      this.validateImages(newProduct.imagesName);
    }

    await this.productRepository.save(newProduct);
    return { ...newProduct, imagesName };
  }

  private validateImages(images: ProductImage[]) {
    const imagesDontExists: string[] = [];
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

  async findAll(paginationDto: GetAllProductsDto, isFeatured?: boolean) {
    const { limit = 10, offset = 0, sortBy = 'title', sortOrder = 'ASC' } = paginationDto;

    const where = isFeatured === true
      ? { isFeatured: true } 
      : {};
    const [products, totalProducts] = await this.productRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
      order: { [sortBy]: sortOrder },
      relations: {
        imagesName: true,
      },
    });

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => ({
        ...product,
        imagesName: product.imagesName?.map((img) => img.url),
      })),
    };
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
        .leftJoinAndSelect('product.imagesName', 'productImages')
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
      imagesName: product.imagesName?.map((img) => img.url),
    };
  }

  async findByTag(tag: string, paginationDto: ProductsListQueryDto) {
    const { limit = 10, offset = 0, sortBy = 'title', sortOrder = 'ASC' } = paginationDto;
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    const products = await queryBuilder
      .leftJoin('product.tags', 'tag')
      .leftJoinAndSelect('product.imagesName', 'productImages')
      .where('LOWER(tag.name) = LOWER(:tag)', { tag })
      .orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    if (products.length == 0)
      throw new NotFoundException(
        `No se encontraron productos con el tag '${tag}'`,
      );
    return products;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { imagesName, categoryId, tagIds = [], ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });
    if (!product) {
      throw new NotFoundException(`No se encontró el producto con id: '${id}'`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (categoryId) {
        const category = await queryRunner.manager
          .getRepository(Category)
          .findOneBy({ id: categoryId });

        if (!category) {
          throw new NotFoundException(`No se encontró la categoría con id: '${categoryId}'`);
        }

        product.category = category;
      }

      if (tagIds.length > 0) {
        const tags = await queryRunner.manager
          .getRepository(Tag)
          .findBy({ id: In(tagIds) });

        if (tags.length !== tagIds.length) {
          throw new NotFoundException(`Algunos tags no existen en la base de datos.`);
        }

        product.tags = tags;
      }

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

      return this.findOnePlain(id);
    } 
    catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
  }

  async searchProducts(searchDto: SearchProductsDto) {
    const { query = '', limit = 10, offset = 0, sortBy = 'title', sortOrder = 'ASC' } = searchDto;
    const [products, totalProducts] = await this.productRepository
      .createQueryBuilder('product')
      .where('product.title ILIKE :q OR product.description ILIKE :q', { q: `%${query}%` })
      .leftJoinAndSelect('product.imagesName', 'productImages')
      .orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => ({
        ...product,
        imagesName: product.imagesName?.map((img) => this.fileService.findOne(img.url)),
      })),
    };
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

  async removeAll() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error);
    }
  }
}
