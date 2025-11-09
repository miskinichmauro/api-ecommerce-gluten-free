import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [CommonModule, ConfigModule, GoogleDriveModule],
  exports: [FilesService],
})
export class FilesModule {}
