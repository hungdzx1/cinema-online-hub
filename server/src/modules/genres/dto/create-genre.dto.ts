import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
