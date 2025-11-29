import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { normalizeSlug } from 'src/common/utils/util';

interface StoredFileMeta {
  id: string;
  type: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  createdAt: Date;
}

const IMAGE_VARIANT_WIDTHS = {
  small: 320,
  medium: 640,
} as const;

type ImageVariantName = keyof typeof IMAGE_VARIANT_WIDTHS;
export type ImageSizeVariant = ImageVariantName | 'original';
export type ImageVariantSet = Record<ImageSizeVariant, string>;

@Injectable()
export class FilesService {
  private readonly storage = new Map<string, Map<string, StoredFileMeta>>();
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly configService: ConfigService) {}

  async uploadFile(type: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'Asegúrate de que el archivo sea una imagen válida',
        code: 'FILE_EMPTY',
        expose: true,
      });
    }

    const normalizedType = this.normalizeType(type);
    const metadata = this.registerFileMetadata(normalizedType, file);
    await this.generateResizedImages(normalizedType, metadata.fileName);
    const url = this.buildPublicUrl(normalizedType, metadata.fileName);

    return { id: metadata.fileName, name: metadata.fileName, url };
  }

  async ensureImageVariants(type: string, fileName: string) {
    const normalizedType = this.normalizeType(type);
    await this.generateResizedImages(normalizedType, fileName);
  }

  getFileNamesFromIds(type: string, ids: string[]): string[] {
    if (!ids || ids.length === 0) {
      return [];
    }
    const normalizedType = this.normalizeType(type);
    return ids.map((id) => this.getMetadataOrFail(normalizedType, id).fileName);
  }

  getPublicUrl(
    type: string,
    fileName: string,
    variant: ImageSizeVariant = 'original',
  ): string {
    const normalizedType = this.normalizeType(type);
    const targetFileName = this.buildVariantFileName(fileName, variant);
    this.getMetadataOrFail(normalizedType, targetFileName);
    return this.buildPublicUrl(normalizedType, targetFileName);
  }

  getImageVariants(type: string, fileName: string): ImageVariantSet {
    return {
      original: this.getPublicUrl(type, fileName, 'original'),
      small: this.getSafeVariantUrl(type, fileName, 'small'),
      medium: this.getSafeVariantUrl(type, fileName, 'medium'),
    };
  }

  findOne(type: string, fileName: string): string {
    const normalizedType = this.normalizeType(type);
    const metadata = this.getMetadataOrFail(normalizedType, fileName);
    const uploadPath = this.buildAbsolutePath(normalizedType, metadata.fileName);

    if (!existsSync(uploadPath)) {
      this.removeMetadata(normalizedType, metadata.fileName);
      throw new NotFoundException({
        message: 'No se encontró la imagen especificada',
        code: 'FILE_IMAGE_NOT_FOUND',
        expose: true,
      });
    }

    return uploadPath;
  }

  private registerFileMetadata(type: string, file: Express.Multer.File): StoredFileMeta {
    const metadata: StoredFileMeta = {
      id: file.filename,
      type,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      createdAt: new Date(),
    };

    this.getTypeStorage(type).set(metadata.id, metadata);
    return metadata;
  }

  private getMetadataOrFail(type: string, id: string): StoredFileMeta {
    const storage = this.getTypeStorage(type);
    let metadata = storage.get(id);

    if (!metadata) {
      const uploadPath = this.buildAbsolutePath(type, id);
      if (existsSync(uploadPath)) {
        metadata = {
          id,
          type,
          fileName: id,
          originalName: id,
          mimeType: this.guessMimeType(id),
          createdAt: new Date(),
        };
        storage.set(id, metadata);
      }
    }

    if (!metadata) {
      throw new NotFoundException({
        message: `No se encontró el archivo con id: ${id}`,
        code: 'FILE_NOT_FOUND',
        expose: true,
      });
    }

    return metadata;
  }

  private getTypeStorage(type: string): Map<string, StoredFileMeta> {
    if (!this.storage.has(type)) {
      this.storage.set(type, new Map());
    }
    return this.storage.get(type)!;
  }

  private buildAbsolutePath(type: string, fileName: string): string {
    const uploadPath = join(process.cwd(), 'static', type, fileName);
    this.ensureFolderExists(type);
    return uploadPath;
  }

  private ensureFolderExists(type: string) {
    const folderPath = join(process.cwd(), 'static', type);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
  }

  private buildPublicUrl(type: string, fileName: string): string {
    const baseUrl = this.configService.get('API_HOST');
    return `${baseUrl}/files/${type}/${fileName}`;
  }

  private normalizeType(type?: string): string {
    return normalizeSlug(type ?? 'products');
  }

  private async generateResizedImages(type: string, fileName: string) {
    const originalPath = this.buildAbsolutePath(type, fileName);
    if (!existsSync(originalPath)) {
      return;
    }

    const variants = Object.keys(IMAGE_VARIANT_WIDTHS) as ImageVariantName[];
    await Promise.all(
      variants.map(async (variant) => {
        const variantFileName = this.buildVariantFileName(fileName, variant);
        const variantPath = this.buildAbsolutePath(type, variantFileName);

        try {
          await sharp(originalPath)
            .resize({ width: IMAGE_VARIANT_WIDTHS[variant], withoutEnlargement: true })
            .toFile(variantPath);
          this.registerVariantMetadata(type, variantFileName, fileName, variant);
        } catch (error) {
          this.logger.warn(
            `No se pudo generar la variante ${variant} para ${fileName}: ${error}`,
          );
        }
      }),
    );
  }

  private buildVariantFileName(fileName: string, variant: ImageSizeVariant) {
    if (variant === 'original') {
      return fileName;
    }

    const extension = extname(fileName);
    const base = extension ? fileName.slice(0, -extension.length) : fileName;
    return `${base}-${variant}${extension}`;
  }

  private registerVariantMetadata(
    type: string,
    fileName: string,
    originalFileName: string,
    variant: ImageVariantName,
  ) {
    const metadata: StoredFileMeta = {
      id: fileName,
      type,
      fileName,
      originalName: `${originalFileName} (${variant})`,
      mimeType: this.guessMimeType(fileName),
      createdAt: new Date(),
    };

    this.getTypeStorage(type).set(metadata.id, metadata);
  }

  private getSafeVariantUrl(type: string, fileName: string, variant: ImageVariantName) {
    try {
      return this.getPublicUrl(type, fileName, variant);
    } catch {
      return this.getPublicUrl(type, fileName, 'original');
    }
  }

  private guessMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }

  private removeMetadata(type: string, id: string) {
    this.getTypeStorage(type).delete(id);
  }
}

