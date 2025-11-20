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
import type { Request, Response, Express } from 'express';
import { fileFilter, fileNamer } from './helpers';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { normalizeSlug } from 'src/common/utils/util';

const destination = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, destination: string) => void,
) => {
  const params = req.params as Record<string, string | undefined>;
  const type = normalizeSlug(params.type ?? 'products');
  const uploadPath = join(process.cwd(), 'static', type);
  mkdirSync(uploadPath, { recursive: true });
  callback(null, uploadPath);
};

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':type/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      storage: diskStorage({
        destination,
        filename: fileNamer,
      }),
    }),
  )
  @ApiOperation({
    summary: 'Carga un archivo en el servidor',
  })
  uploadFile(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.uploadFile(type, file);
  }

  @Get(':type/:fileName')
  @ApiOperation({
    summary: 'Devuelve un archivo por nombre',
  })
  findOne(
    @Res() res: Response,
    @Param('type') type: string,
    @Param('fileName') fileName: string,
  ) {
    const path = this.filesService.findOne(type, fileName);
    res.sendFile(path);
  }
}

