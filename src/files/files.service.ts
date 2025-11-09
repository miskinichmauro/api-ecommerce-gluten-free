import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async uploadFile(file: Express.Multer.File, toFolderId?: string) {
    if (!file) {
      throw new BadRequestException('Archivo inválido');
    }
    return await this.googleDriveService.uploadFile(file, toFolderId);
  }

  async findById(fileId: string) {
    return await this.googleDriveService.getFileById(fileId);
  }

  async findByName(name: string, opts?: { mimeContains?: string; inFolderId?: string; pageSize?: number; pageToken?: string }) {
    return await this.googleDriveService.searchFilesByName(name, opts);
  }

  async listFolder(folderId: string, opts?: { pageSize?: number; pageToken?: string }) {
    return await this.googleDriveService.listFilesInFolder(folderId, opts);
  }

  async createFolder(name: string, parentFolderId?: string) {
    return await this.googleDriveService.createFolder(name, parentFolderId);
  }

  async ensureFolderPath(path: string, rootFolderId?: string) {
    return await this.googleDriveService.ensureFolderPath(path, rootFolderId);
  }
}
