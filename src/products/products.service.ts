import {
  BadRequestException,
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
import { ProductImage } from './entities';
import { Product } from './entities/product.entity';
import { SearchProductsDto } from 'src/common/dto/searchProducts.dto';
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { FilesService } from 'src/files/files.service';

type ProductWithImages = Omit<Product, 'images'> & { images?: string[] };

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  private readonly fileType = 'products';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly fileService: FilesService,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const {
      imageIds = [],
      imageFileNames = [],
      categoryId,
      tagIds = [],
      ...productDetails
    } = createProductDto;
    if (!categoryId) {
      throw new BadRequestException('Debe proporcionar una categoría para el producto.');
    }

    const category = await this.dataSource.getRepository(Category).findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`No se encontró la categoría con id: ${categoryId}`);
    }

    let tags: Tag[] | null = null;
    if (tagIds.length > 0) {
      tags = await this.dataSource.getRepository(Tag).findBy({ id: In(tagIds) });
      if (tags?.length !== tagIds.length) {
        throw new NotFoundException(`Algunos tags no existen en la base de datos.`);
      }
    }

    const imageFileNamesResolved: string[] =
      imageIds.length > 0
        ? this.fileService.getFileNamesFromIds(this.fileType, imageIds)
        : imageFileNames;

    const newProduct = this.productRepository.create({
      ...productDetails,
      images: imageFileNamesResolved.map((fileName) =>
        this.productImageRepository.create({ fileName }),
      ),
      user,
      category,
      tags,
    } as DeepPartial<Product>);

    await this.productRepository.save(newProduct);
    return this.mapProductResponse(newProduct);
  }


  async findAll(paginationDto: GetAllProductsDto) {
    const {
      limit = 10,
      offset = 0,
      sortBy = 'title',
      sortOrder = 'ASC',
      isFeatured,
      categoryId,
      tagIds = [],
    } = paginationDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(offset)
      .take(limit)
      .distinct(true);

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tagIds.length > 0) {
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    const [products, totalProducts] = await queryBuilder.getManyAndCount();

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => this.mapProductResponse(product)),
    };
  }

  async findOne(param: string) {
    let product: Product | null;

    if (isUUId(param)) {
      product = await this.productRepository.findOne({
        where: { id: param },
        relations: { images: true },
      });
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

    return this.mapProductResponse(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { imageIds, categoryId, tagIds = [], ...toUpdate } = updateProductDto;

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

      if (imageIds !== undefined) {
        const imageFileNames: string[] =
          imageIds.length > 0
            ? this.fileService.getFileNamesFromIds(this.fileType, imageIds)
            : [];
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = imageFileNames.map((fileName) =>
          this.productImageRepository.create({ fileName }),
        );
      }

      product.user = user;

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
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
      .leftJoinAndSelect('product.images', 'productImages')
      .orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      count: totalProducts,
      pages: Math.ceil(totalProducts / limit),
      products: products.map((product) => this.mapProductResponse(product)),
    };
  }

  private mapProductResponse(product: Product): ProductWithImages {
    const images =
      product.images?.map((img) =>
        this.fileService.getPublicUrl(this.fileType, img.fileName),
      ) ?? [];

    return {
      ...(product as unknown as Omit<Product, 'images'>),
      images,
    } as ProductWithImages;
  }

  handleException(error: unknown) {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof Error) {
      this.logger.error(error.message, error.stack);
    } else {
      this.logger.error(`Error no controlado: ${JSON.stringify(error)}`);
    }

    this.handleDBException(error);
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado. Por favor, verifique los logs',
    );
  }

  handleDBException(error: unknown) {
    if (this.isPostgresError(error) && error.code === '23505') {
      throw new BadRequestException(error.detail ?? 'Violación de restricción única');
    }
  }

  private isPostgresError(error: unknown): error is { code?: string; detail?: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }

  async removeAll() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('product_tags')
        .where({})
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(ProductImage)
        .where({})
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Product)
        .where({})
        .execute();

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBException(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}



