import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsIn(['new_episode', 'system'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  linkUrl?: string;
}
