import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  // POST /watchlist — Thêm phim xem sau
  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: CreateWatchlistDto) {
    return this.watchlistService.add(user.id, dto.movieId);
  }

  // GET /watchlist — Danh sách xem sau của mình
  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.watchlistService.findByUser(user.id);
  }

  // GET /watchlist/check/:movieId — Đã lưu chưa
  @Get('check/:movieId')
  check(@CurrentUser() user: AuthUser, @Param('movieId') movieId: string) {
    return this.watchlistService.isInWatchlist(user.id, +movieId);
  }

  // DELETE /watchlist/:movieId — Bỏ khỏi danh sách
  @Delete(':movieId')
  remove(@CurrentUser() user: AuthUser, @Param('movieId') movieId: string) {
    return this.watchlistService.remove(user.id, +movieId);
  }
}
