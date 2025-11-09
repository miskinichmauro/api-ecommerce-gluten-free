import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import type { Express } from 'express';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UploadToFolderDto } from './dto/upload-to-folder.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sube un archivo a Google Drive' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadToFolderDto: UploadToFolderDto,
  ) {
    const { folderId } = uploadToFolderDto ?? {};
    return await this.filesService.uploadFile(file, folderId);
  }

  @Get('drive/search')
  @ApiOperation({ summary: 'Busca archivos por nombre' })
  async searchByName(
    @Query('name') name: string,
    @Query('folderId') folderId?: string,
  ) {
    return await this.filesService.findByName(name, {
      inFolderId: folderId,
      mimeContains: 'image/',
    });
  }

  @Get('drive/:id')
  @ApiOperation({ summary: 'Obtiene un archivo por ID' })
  async getFileById(@Param('id') id: string) {
    return await this.filesService.findById(id);
  }

  @Get('drive/folder/:folderId')
  @ApiOperation({ summary: 'Lista todos los archivos dentro de una carpeta' })
  async listFiles(@Param('folderId') folderId: string) {
    return await this.filesService.listFolder(folderId);
  }

  @Post('drive/folder')
  @ApiOperation({ summary: 'Crea una carpeta o una jerarquía de carpetas' })
  async createFolder(@Body() body: CreateFolderDto) {
    return await this.filesService.ensureFolderPath(body.path, body.parentFolderId);
  }
}
