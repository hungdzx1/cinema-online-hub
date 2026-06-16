import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  // GET /genres — Danh sách thể loại (public, ai cũng xem được)
  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  // GET /genres/all — Tất cả thể loại kể cả ẩn (admin)
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.genresService.findAllForAdmin();
  }

  // GET /genres/:slug — Chi tiết thể loại theo slug (public)
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.genresService.findBySlug(slug);
  }

  // POST /genres — Tạo thể loại (admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateGenreDto) {
    return this.genresService.create(dto);
  }

  // PATCH /genres/:id — Cập nhật (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    return this.genresService.update(+id, dto);
  }

  // DELETE /genres/:id — Xóa (admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.genresService.remove(+id);
  }
}
