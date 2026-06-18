import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorReportsService } from './error-reports.service';
import { ErrorReportsController } from './error-reports.controller';
import { ErrorReport } from './error-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorReport])],
  controllers: [ErrorReportsController],
  providers: [ErrorReportsService],
})
export class ErrorReportsModule {}
