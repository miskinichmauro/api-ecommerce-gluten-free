import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from 'src/contacts/contacts.module';
import { RecipesModule } from 'src/recipes/recipes.module';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ConfigModule, 
    ProductsModule, 
    AuthModule, 
    UsersModule, 
    ContactsModule, 
    RecipesModule,
    RolesModule,
  ],
})
export class SeedModule {}
