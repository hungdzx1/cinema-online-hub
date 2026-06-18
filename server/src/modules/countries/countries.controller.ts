import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  // GET /countries — Danh sách (public)
  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  // GET /countries/slug/:slug — Chi tiết theo slug (public)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.countriesService.findBySlug(slug);
  }

  // GET /countries/:id — Chi tiết theo id (public)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findById(+id);
  }

  // POST /countries — Tạo (admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCountryDto) {
    return this.countriesService.create(dto);
  }

  // PATCH /countries/:id — Sửa (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCountryDto) {
    return this.countriesService.update(+id, dto);
  }

  // DELETE /countries/:id — Xóa (admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.countriesService.remove(+id);
  }
}
