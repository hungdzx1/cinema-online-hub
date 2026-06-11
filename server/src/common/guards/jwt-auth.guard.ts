import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard kiểm tra JWT — dùng @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
