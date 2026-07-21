import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './rating.entity';
import { Movie } from '../movies/movies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Movie])],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
