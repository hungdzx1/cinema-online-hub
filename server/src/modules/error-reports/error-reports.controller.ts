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
import { ErrorReportsService } from './error-reports.service';
import { CreateErrorReportDto } from './dto/create-error-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('error-reports')
export class ErrorReportsController {
  constructor(private readonly reportsService: ErrorReportsService) {}

  // POST /error-reports — User gửi báo lỗi (login)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateErrorReportDto) {
    return this.reportsService.create(user.id, dto);
  }

  // GET /error-reports/me — Báo lỗi của mình (login)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthUser) {
    return this.reportsService.findByUser(user.id);
  }

  // GET /error-reports — Admin xem tất cả
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.reportsService.findAll();
  }

  // PATCH /error-reports/:id/status — Admin cập nhật trạng thái
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.reportsService.updateStatus(+id, dto.status);
  }

  // DELETE /error-reports/:id — Admin xóa
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
