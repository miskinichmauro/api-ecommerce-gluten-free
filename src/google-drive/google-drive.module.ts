import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
  imports: [ConfigModule],
})
export class GoogleDriveModule {}
