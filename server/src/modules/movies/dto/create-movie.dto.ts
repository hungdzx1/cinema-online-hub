import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { MovieType } from '../../../common/enums/movie-type.enum';
import { MovieStatus } from '../../../common/enums/movie-status.enum';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  posterUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bannerUrl?: string;

  @IsEnum(MovieType)
  @IsNotEmpty()
  type: MovieType;

  @IsEnum(MovieStatus)
  @IsOptional()
  status?: MovieStatus;

  @IsInt()
  @IsOptional()
  releaseYear?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
