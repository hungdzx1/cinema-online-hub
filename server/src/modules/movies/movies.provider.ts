import { DataSource } from 'typeorm';
import { Movie } from './movies.entity';

export const moviesProviders = [
  {
    provide: 'MOVIE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Movie),
    inject: ['DATA_SOURCE'],
  },
];
