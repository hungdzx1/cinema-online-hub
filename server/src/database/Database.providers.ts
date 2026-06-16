import { DataSource } from 'typeorm';
import * as fs from 'fs';

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
        // Provide more context in logs for debugging connection/handshake errors

        console.error('Failed to initialize DataSource:', err);
        throw err;
      }
    },
  },
];
