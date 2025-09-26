import { Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({
    summary: 'Recrea toda la base de datos'
  })
  async executeSeed(@Headers('ApiKey') apiKey: string
  ) {
    return await this.seedService.executeSeed(apiKey);
  }
}
