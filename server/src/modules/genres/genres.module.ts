import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { genreProviders } from './genre.provider';
import { DatabaseModule } from '../../database/Database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GenresController],
  providers: [...genreProviders, GenresService],
  exports: [GenresService], // Export cho MoviesModule dùng (gán thể loại cho phim)
})
export class GenresModule {}
