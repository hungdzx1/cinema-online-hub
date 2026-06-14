import { PartialType } from '@nestjs/mapped-types'; // npm i @nestjs/mapped-types
import { CreateMovieDto } from './create-movie.dto';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}