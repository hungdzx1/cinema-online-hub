import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateEpisodeDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @Min(1)
  episodeNumber: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  embedUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  serverName?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  skipIntroSeconds?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  durationSeconds?: number;
}
