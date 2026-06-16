import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class GenresService {
  constructor(
    @Inject('GENRE_REPOSITORY')
    private genreRepository: Repository<Genre>,
  ) {}

  // Lấy danh sách thể loại đang hiển thị (public)
  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({
      where: { isVisible: true },
      order: { name: 'ASC' },
    });
  }

  // Lấy TẤT CẢ thể loại kể cả ẩn (admin)
  async findAllForAdmin(): Promise<Genre[]> {
    return this.genreRepository.find({ order: { name: 'ASC' } });
  }

  // Tìm theo id
  async findById(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException(`Không tìm thấy thể loại #${id}`);
    return genre;
  }

  // Tìm theo slug (public)
  async findBySlug(slug: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { slug } });
    if (!genre) throw new NotFoundException(`Không tìm thấy thể loại ${slug}`);
    return genre;
  }

  // Tạo thể loại mới (admin)
  async create(dto: CreateGenreDto): Promise<Genre> {
    const slug = slugify(dto.name);

    // Kiểm tra trùng tên hoặc slug
    const existed = await this.genreRepository.findOne({ where: { slug } });
    if (existed) throw new ConflictException('Thể loại đã tồn tại');

    const genre = this.genreRepository.create({
      name: dto.name,
      slug,
      isVisible: dto.isVisible ?? true,
    });
    return this.genreRepository.save(genre);
  }

  // Cập nhật thể loại (admin)
  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findById(id);

    // Nếu đổi tên thì tạo lại slug
    if (dto.name) {
      genre.name = dto.name;
      genre.slug = slugify(dto.name);
    }
    if (dto.isVisible !== undefined) {
      genre.isVisible = dto.isVisible;
    }

    return this.genreRepository.save(genre);
  }

  // Xóa thể loại (admin)
  async remove(id: number): Promise<void> {
    const genre = await this.findById(id);
    await this.genreRepository.remove(genre);
  }
}
