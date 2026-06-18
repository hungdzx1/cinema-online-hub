import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Đọc CA certificate của Aiven 1 lần
        // const ca = fs.readFileSync('ca.pem').toString();

        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get('DB_PORT')) || 3306,
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),

          // SSL cho Aiven - đặt ở extra để truyền THẲNG xuống mysql2
          // ssl: { ca },
          // // extra: {
          //   // ssl: { ca },
          // },

          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
