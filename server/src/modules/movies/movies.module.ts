import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movies.entity';
import { Genre } from '../genres/genre.entity';
import { Episode } from '../episodes/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre, Episode])],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
