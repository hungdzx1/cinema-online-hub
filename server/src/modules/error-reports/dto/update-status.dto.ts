import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '../../../common/enums/report-status.enum';

export class UpdateStatusDto {
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus; // pending | resolved | ignored
}
