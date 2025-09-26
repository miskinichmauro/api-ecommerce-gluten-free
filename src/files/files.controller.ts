import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import type { Response, Express } from 'express';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  @ApiOperation({
    summary: 'Carga un archivo en el servidor',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @Get('product/:fileName')
  @ApiOperation({
    summary: 'Devuelve un archivo por nombre',
  })
  findOne(@Res() res: Response, @Param('fileName') fileName: string) {
    const path = this.filesService.findOne(fileName);
    res.sendFile(path);
  }
}
