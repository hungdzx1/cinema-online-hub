import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class SaveProgressDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @IsNotEmpty()
  episodeId: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  progressSeconds?: number; // Xem đến giây thứ mấy
}
