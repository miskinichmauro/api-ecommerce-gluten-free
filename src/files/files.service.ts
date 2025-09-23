import { existsSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService
  ) {}
  findOne(fileName: string) {
    const path = join(__dirname, '../../static/products', fileName);
    
    if (!existsSync(path)) {
      throw new NotFoundException('No se encontró la imagen especificada');
    }

    return path;
  }

  uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Asegúrate de que el archivo sea una imagen valida');
    }

    const url = `${this.configService.get('API_HOST')}/files/product/${file.filename}`;
    return { name: file.filename , url };
  }
}
