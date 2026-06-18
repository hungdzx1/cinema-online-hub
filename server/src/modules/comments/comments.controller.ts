import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // POST /comments — Viết bình luận (cần login)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(user.id, dto);
  }

  // GET /comments/movie/:movieId — Xem bình luận của phim (public)
  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId: string) {
    return this.commentsService.findByMovie(+movieId);
  }

  // DELETE /comments/:id — Xóa bình luận của mình (cần login)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.commentsService.remove(+id, user.id);
  }

  // PATCH /comments/:id/hide — Ẩn/hiện bình luận (admin)
  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleHide(@Param('id') id: string) {
    return this.commentsService.toggleHide(+id);
  }
}
