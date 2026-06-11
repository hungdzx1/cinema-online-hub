import { DataSource } from 'typeorm';
import { User } from './user.entity';

// Giống pattern cô dạy với studentProviders
export const userProviders = [
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];