import { DataSource } from 'typeorm';

// Provider cung cấp DATA_SOURCE cho toàn app (giống pattern cô dạy)
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        ssl: {
          rejectUnauthorized: false,
        },

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],

        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
