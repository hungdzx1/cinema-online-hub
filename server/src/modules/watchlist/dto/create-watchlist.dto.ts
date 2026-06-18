import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateWatchlistDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;
}
