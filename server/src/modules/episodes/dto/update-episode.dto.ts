import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

// Viết thủ công thay PartialType để tránh lỗi ESLint
export class UpdateEpisodeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  episodeNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  embedUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  serverName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  skipIntroSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
