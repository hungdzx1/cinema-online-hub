import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

// Kiểu user được JwtStrategy gắn vào request
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

// Dùng: @CurrentUser() user: AuthUser — lấy user hiện tại từ JWT
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
