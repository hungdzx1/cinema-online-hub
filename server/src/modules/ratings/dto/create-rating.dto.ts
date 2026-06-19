import {
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsString()
  @IsOptional()
  content?: string;
}
