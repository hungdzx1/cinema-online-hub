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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // POST /notifications — Admin tạo thông báo
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  // GET /notifications — Thông báo của mình (login)
  @Get()
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthUser) {
    return this.notificationsService.findByUser(user.id);
  }

  // GET /notifications/unread-count — Số chưa đọc (login)
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  countUnread(@CurrentUser() user: AuthUser) {
    return this.notificationsService.countUnread(user.id);
  }

  // PATCH /notifications/read-all — Đánh dấu tất cả đã đọc (login)
  // Đặt TRƯỚC :id/read để không bị nhầm "read-all" là id
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  // PATCH /notifications/:id/read — Đánh dấu 1 cái đã đọc (login)
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.markAsRead(+id, user.id);
  }

  // DELETE /notifications/:id — Xóa thông báo (login)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notificationsService.remove(+id, user.id);
  }
}
