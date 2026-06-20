import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class GenresService {
  // Key cache cho danh sách thể loại
  private readonly CACHE_KEY = 'genres_all';

  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    // CACHE_MANAGER lấy từ CacheModule global (app.module)
    @Inject(CACHE_MANAGER)
    private cacheManager: cacheManager_1.Cache,
  ) {}

  // Danh sách thể loại (public) — CÓ CACHE THỦ CÔNG
  async findAll(): Promise<Genre[]> {
    // 1. Thử lấy từ cache trước
    const cached = await this.cacheManager.get<Genre[]>(this.CACHE_KEY);
    if (cached) {
      return cached; // Có cache → trả luôn, KHÔNG query DB
    }

    // 2. Không có cache → query DB
    const genres = await this.genreRepository.find({
      where: { isVisible: true },
      order: { name: 'ASC' },
    });

    // 3. Lưu vào cache 120 giây
    await this.cacheManager.set(this.CACHE_KEY, genres, 120000);
    return genres;
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
    const saved = await this.genreRepository.save(genre);

    // Xóa cache để lần sau lấy dữ liệu MỚI (có thể loại vừa tạo)
    await this.cacheManager.del(this.CACHE_KEY);
    return saved;
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

    const updated = await this.genreRepository.save(genre);

    // Xóa cache để lần sau lấy dữ liệu mới
    await this.cacheManager.del(this.CACHE_KEY);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findById(id);
    await this.genreRepository.remove(genre);

    // Xóa cache để lần sau lấy dữ liệu mới
    await this.cacheManager.del(this.CACHE_KEY);
  }
}
