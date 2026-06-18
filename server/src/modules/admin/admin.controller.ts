import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // TẤT CẢ route admin cần login + quyền admin
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/stats — Thống kê tổng quan
  @Get('stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  // GET /admin/top-movies — Top 10 phim xem nhiều
  @Get('top-movies')
  getTopMovies() {
    return this.adminService.getTopMovies();
  }

  // GET /admin/recent-users — User mới đăng ký
  @Get('recent-users')
  getRecentUsers() {
    return this.adminService.getRecentUsers();
  }
}
