import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';
import type { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:fileName')
  findOne(
    @Res() res: Response,
    @Param('fileName') fileName: string
  ) {
    const path = this.filesService.findOne(fileName);
    res.sendFile(path);
  }

  @Post('product/upload')
  @UseInterceptors(FileInterceptor('file',
    {
      fileFilter: fileFilter,
      storage: diskStorage({ 
        destination: './static/products',
        filename: fileNamer,
      })
    }
  ))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }
}
