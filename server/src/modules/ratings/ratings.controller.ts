import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard) // Tất cả route đều cần login
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  // POST /ratings — Đánh giá phim
  @Post()
  rate(@CurrentUser() user: AuthUser, @Body() dto: CreateRatingDto) {
    return this.ratingsService.rate(user.id, dto);
  }

  // GET /ratings/movie/:movieId — Xem điểm mình đã đánh giá
  @Get('movie/:movieId')
  getUserRating(
    @CurrentUser() user: AuthUser,
    @Param('movieId') movieId: string,
  ) {
    return this.ratingsService.getUserRating(user.id, +movieId);
  }

  // DELETE /ratings/movie/:movieId — Xóa đánh giá của mình
  @Delete('movie/:movieId')
  remove(@CurrentUser() user: AuthUser, @Param('movieId') movieId: string) {
    return this.ratingsService.remove(user.id, +movieId);
  }
}
