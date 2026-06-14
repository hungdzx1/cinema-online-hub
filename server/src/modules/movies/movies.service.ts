import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const newMovie = this.movieRepository.create(createMovieDto);
    return await this.movieRepository.save(newMovie);
  }

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Không tìm thấy phim với ID: ${id}`);
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id); // Kiểm tra xem có tồn tại không
    Object.assign(movie, updateMovieDto);
    return await this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<{ message: string }> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
    return { message: `Đã xóa thành công phim:` };
  }
}
