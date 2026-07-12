import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { MovieType } from '../../../common/enums/movie-type.enum';
import { MovieStatus } from '../../../common/enums/movie-status.enum';

// Viết thủ công thay PartialType để tránh lỗi ESLint
export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  posterUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @IsOptional()
  @IsEnum(MovieType)
  type?: MovieType;

  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @IsOptional()
  @IsInt()
  releaseYear?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  scheduleDate?: string;
}
