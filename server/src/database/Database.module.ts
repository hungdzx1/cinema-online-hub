import { Module } from '@nestjs/common';
import { databaseProviders } from './Database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders], // Export để các module khác dùng DATA_SOURCE
})
export class DatabaseModule {}
