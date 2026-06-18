import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @IsOptional()
  parentId?: number; // Nếu là trả lời bình luận khác

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
