import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseSetupService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSetupService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent');
      this.logger.log('Postgres extension unaccent confirmed');
    } catch (error) {
      this.logger.error('Failed to ensure unaccent extension exists', error as Error);
    }
  }
}
