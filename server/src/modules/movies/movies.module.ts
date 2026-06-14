import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movies } from './movies.provider';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, Movies]
})
export class MoviesModule {}
