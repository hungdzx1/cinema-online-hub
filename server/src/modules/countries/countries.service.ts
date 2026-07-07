import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './countries.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { slugify } from '../../common/utils/slugify.util';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });
    if (!country) throw new NotFoundException(`Không tìm thấy quốc gia #${id}`);
    return country;
  }

  async findBySlug(slug: string): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { slug } });
    if (!country)
      throw new NotFoundException(`Không tìm thấy quốc gia ${slug}`);
    return country;
  }

  async create(dto: CreateCountryDto): Promise<Country> {
    const slug = slugify(dto.name);

    const existed = await this.countryRepository.findOne({ where: { slug } });
    if (existed) throw new ConflictException('Quốc gia đã tồn tại');

    const country = new Country();
    country.name = dto.name;
    country.slug = slug;
    return this.countryRepository.save(country);
  }

  async update(id: number, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.findById(id);

    if (dto.name) {
      country.name = dto.name;
      country.slug = slugify(dto.name);
    }

    return this.countryRepository.save(country);
  }

  async remove(id: number): Promise<{ message: string }> {
    const country = await this.findById(id);
    await this.countryRepository.remove(country);
    return { message: 'Đã xóa quốc gia' };
  }
}
