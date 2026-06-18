import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard) // Tất cả route cần login
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // POST /favorites — Thêm phim yêu thích
  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(user.id, dto.movieId);
  }

  // GET /favorites — Danh sách phim yêu thích của mình
  @Get()
  findMyFavorites(@CurrentUser() user: AuthUser) {
    return this.favoritesService.findByUser(user.id);
  }

  // GET /favorites/check/:movieId — Kiểm tra đã thích chưa
  @Get('check/:movieId')
  check(@CurrentUser() user: AuthUser, @Param('movieId') movieId: string) {
    return this.favoritesService.isFavorite(user.id, +movieId);
  }

  // DELETE /favorites/:movieId — Bỏ yêu thích
  @Delete(':movieId')
  remove(@CurrentUser() user: AuthUser, @Param('movieId') movieId: string) {
    return this.favoritesService.remove(user.id, +movieId);
  }
}
