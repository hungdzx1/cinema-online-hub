import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
