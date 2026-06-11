import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userProviders } from './user.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],           // Cần DatabaseModule để có DATA_SOURCE
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
  exports: [UsersService],             // Export để AuthModule dùng được
})
export class UsersModule {}