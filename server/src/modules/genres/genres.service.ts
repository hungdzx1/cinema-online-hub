import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({
      where: { isVisible: true },
      order: { name: 'ASC' },
    });
  }

  async findAllForAdmin(): Promise<Genre[]> {
    return this.genreRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException(`Không tìm thấy thể loại #${id}`);
    return genre;
  }

  async findBySlug(slug: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { slug } });
    if (!genre) throw new NotFoundException(`Không tìm thấy thể loại ${slug}`);
    return genre;
  }

  async create(dto: CreateGenreDto): Promise<Genre> {
    const slug = slugify(dto.name);

    const existed = await this.genreRepository.findOne({ where: { slug } });
    if (existed) throw new ConflictException('Thể loại đã tồn tại');

    const genre = this.genreRepository.create({
      name: dto.name,
      slug,
      isVisible: dto.isVisible ?? true,
    });
    return this.genreRepository.save(genre);
  }

  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findById(id);

    if (dto.name) {
      genre.name = dto.name;
      genre.slug = slugify(dto.name);
    }
    if (dto.isVisible !== undefined) {
      genre.isVisible = dto.isVisible;
    }

    return this.genreRepository.save(genre);
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findById(id);
    await this.genreRepository.remove(genre);
  }
}
