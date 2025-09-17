import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Asegúrate de que el archivo sea una imagen valida');
    }
    return { fileName: file.filename };
  }
}
