import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccountController } from './account.controller';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, AccountController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
