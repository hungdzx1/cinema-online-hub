import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';
import { ErrorType } from '../../../common/enums/error-type.enum';

export class CreateErrorReportDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @IsOptional()
  episodeId?: number;

  @IsEnum(ErrorType)
  @IsNotEmpty()
  errorType: ErrorType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
