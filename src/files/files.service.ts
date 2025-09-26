import { existsSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService
  ) {}

  uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Asegúrate de que el archivo sea una imagen valida');
    }

    const url = `${this.configService.get('API_HOST')}/files/product/${file.filename}`;
    return { name: file.filename , url };
  }

  findOne(fileName: string) {
    const uploadPath = join(process.cwd(), 'static/products', fileName);
    console.log('findOne', uploadPath);
    
    if (!existsSync(uploadPath)) {
      throw new NotFoundException('No se encontró la imagen especificada');
    }

    return uploadPath;
  }
}
