import {
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  IsIn,
  Min,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MovieType } from '../../../common/enums/movie-type.enum';
// ⚠️ KIỂM TRA đường dẫn import enum cho khớp với create-movie.dto.ts của bạn
// (số dấu "../" có thể khác tùy độ sâu thư mục dto/)

export class FilterMovieDto {
  // Từ khóa tìm kiếm (theo title hoặc slug)
  @IsOptional()
  @IsString()
  keyword?: string;

  // Quốc gia — lọc phim thuộc 1 quốc gia (không gửi = tất cả quốc gia)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;

  // Loại phim — phim_le | phim_bo | hoat_hinh | anime (không gửi = tất cả loại)
  @IsOptional()
  @IsEnum(MovieType)
  type?: MovieType;

  // Thể loại — FE gửi "?genreIds=1,2,3", kết hợp AND (phim phải có ĐỦ tất cả)
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n));
    }
    return value;
  })
  @IsArray()
  @IsInt({ each: true })
  genreIds?: number[];

  // Năm sản xuất — lọc đúng 1 năm (không gửi = mọi năm)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  releaseYear?: number;

  // Sắp xếp kết quả — newest (mới nhất) | imdb (điểm cao) | views (xem nhiều)
  @IsOptional()
  @IsIn(['newest', 'imdb', 'views'])
  sortBy?: string = 'newest';

  // Phân trang — trang hiện tại (bắt đầu từ 1)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  // Số phim mỗi trang
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
