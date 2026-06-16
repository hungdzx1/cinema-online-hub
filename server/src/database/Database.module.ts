import { Module } from '@nestjs/common';
import { databaseProviders } from './Database.providers';
import { ConfigModule } from '@nestjs/config';

@Module({
  // Import ConfigModule vì trong provider của bạn đang xài ConfigService
  imports: [ConfigModule], 
  
  // Đăng ký provider
  providers: [...databaseProviders], 
  
  // Export ra để các module khác (như UserModule, MovieModule...) có thể dùng 'DATA_SOURCE'
  exports: [...databaseProviders], 
})
export class DatabaseModule {}