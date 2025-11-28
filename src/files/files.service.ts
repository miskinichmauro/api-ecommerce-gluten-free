import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeSlug } from 'src/common/utils/util';

interface StoredFileMeta {
  id: string;
  type: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  createdAt: Date;
}

@Injectable()
export class FilesService {
  private readonly storage = new Map<string, Map<string, StoredFileMeta>>();

  constructor(private readonly configService: ConfigService) {}

  uploadFile(type: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'Asegúrate de que el archivo sea una imagen válida',
        code: 'FILE_EMPTY',
        expose: true,
      });
    }

    const normalizedType = this.normalizeType(type);
    const metadata = this.registerFileMetadata(normalizedType, file);
    const url = this.buildPublicUrl(normalizedType, metadata.fileName);

    return { id: metadata.fileName, name: metadata.fileName, url };
  }

  getFileNamesFromIds(type: string, ids: string[]): string[] {
    if (!ids || ids.length === 0) {
      return [];
    }
    const normalizedType = this.normalizeType(type);
    return ids.map((id) => this.getMetadataOrFail(normalizedType, id).fileName);
  }

  getPublicUrl(type: string, fileName: string): string {
    const normalizedType = this.normalizeType(type);
    this.getMetadataOrFail(normalizedType, fileName);
    return this.buildPublicUrl(normalizedType, fileName);
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

