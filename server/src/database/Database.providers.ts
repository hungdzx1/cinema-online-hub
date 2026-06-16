import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    // Inject ConfigService vào đây
    inject: [ConfigService], 
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];