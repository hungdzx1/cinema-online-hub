import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard) // Tất cả routes cần đăng nhập
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users — Lấy tất cả users (Admin only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // GET /users/me — Xem thông tin cá nhân
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  // GET /users/:id — Xem thông tin user (Admin)
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  // PATCH /users/me — Cập nhật thông tin cá nhân
  @Patch('me')
  updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  // PATCH /users/:id/ban — Khóa/Mở khóa tài khoản (Admin)
  @Patch(':id/ban')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleBan(@Param('id') id: string) {
    return this.usersService.toggleBan(+id);
  }

  // DELETE /users/:id — Xóa user (Admin)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}