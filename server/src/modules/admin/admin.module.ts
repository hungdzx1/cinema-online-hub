import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Movie } from '../movies/movies.entity';
import { CommentEntity } from '../comments/comment.entity';
import { ErrorReport } from '../error-reports/error-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Movie, CommentEntity, ErrorReport]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
