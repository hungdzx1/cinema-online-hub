import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  // POST /episodes — Thêm tập (admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateEpisodeDto) {
    return this.episodesService.create(dto);
  }

  // GET /episodes/movie/:movieId — Danh sách tập của 1 phim (cần login)
  @Get('movie/:movieId')
  @UseGuards(JwtAuthGuard)
  findByMovie(@Param('movieId') movieId: string) {
    return this.episodesService.findByMovie(+movieId);
  }

  // GET /episodes/:id — Xem 1 tập, lấy embed_url (cần login)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(+id);
  }

  // PATCH /episodes/:id — Sửa tập (admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    return this.episodesService.update(+id, dto);
  }

  // DELETE /episodes/:id — Xóa tập (admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.episodesService.remove(+id);
  }
}
