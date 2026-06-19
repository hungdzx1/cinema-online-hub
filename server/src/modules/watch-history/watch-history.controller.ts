import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('watch-history')
@UseGuards(JwtAuthGuard)
export class WatchHistoryController {
  constructor(private readonly historyService: WatchHistoryService) {}

  // POST /watch-history — Lưu tiến độ xem
  @Post()
  saveProgress(@CurrentUser() user: AuthUser, @Body() dto: SaveProgressDto) {
    return this.historyService.saveProgress(user.id, dto);
  }

  // GET /watch-history — Lịch sử xem (phim "Xem tiếp")
  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.historyService.findByUser(user.id);
  }

  // DELETE /watch-history/all — Xóa toàn bộ lịch sử
  @Delete('all')
  clearAll(@CurrentUser() user: AuthUser) {
    return this.historyService.clearAll(user.id);
  }

  // DELETE /watch-history/:id — Xóa 1 bản ghi
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.historyService.remove(user.id, +id);
  }
}
