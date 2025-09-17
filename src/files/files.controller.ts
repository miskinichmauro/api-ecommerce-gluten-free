import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file',
    {
      fileFilter: fileFilter,
      storage: diskStorage({ 
        destination: './static/uploads',
        filename: fileNamer,
      })
    }
  ))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }
}
