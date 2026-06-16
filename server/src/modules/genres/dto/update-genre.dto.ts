import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';

// PartialType làm tất cả field của CreateGenreDto thành optional
export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
