import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number; // Điểm từ 1 đến 10
}
