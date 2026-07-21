import {
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsString()
  @IsOptional()
  content?: string;
}
