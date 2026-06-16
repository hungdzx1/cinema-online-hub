import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, MaxLength } from 'class-validator';

export enum MovieType {
  SINGLE = 'SINGLE',
  SERIES = 'SERIES',
}

export enum MovieStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  TRAILER = 'TRAILER',
}

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  poster_url?: string;

  @IsString()
  @IsOptional()
  backdrop_url?: string;

  @IsString()
  @IsOptional()
  trailer_url?: string;

  @IsEnum(MovieType)
  @IsNotEmpty()
  type: MovieType;

  @IsEnum(MovieStatus)
  @IsNotEmpty()
  status: MovieStatus;

  @IsInt()
  @IsOptional()
  release_year?: number;

  @IsInt()
  @IsOptional()
  country_id?: number;
}
