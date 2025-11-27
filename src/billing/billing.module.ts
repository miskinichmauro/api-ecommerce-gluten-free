import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingProfile } from './entities/billing-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingProfile]), AuthModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
