import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Role } from 'src/auth/enums/role.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @Auth(Role.admin)
  async executeSeed() {
    return await this.seedService.executeSeed();
  }
}
