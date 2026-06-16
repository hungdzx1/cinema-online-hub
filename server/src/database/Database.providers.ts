import { DataSource } from 'typeorm';
import * as fs from 'fs';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      console.log(
        '[DB] Initializing with host:',
        process.env.DB_HOST,
        'port:',
        process.env.DB_PORT,
      );
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        ssl: {
          ca: fs.readFileSync('ca.pem'),
        },
        extra: {
          ssl: {
            ca: fs.readFileSync('ca.pem'),
          },
        },

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],

        synchronize: false,
      });

      try {
        return await dataSource.initialize();
      } catch (err) {
        console.error('Failed to initialize DataSource:', err);
        throw err;
      }
    },
  },
];
