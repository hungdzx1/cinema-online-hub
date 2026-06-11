import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userProviders } from './user.provider';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],          
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
  exports: [UsersService],             
})
export class UsersModule {}