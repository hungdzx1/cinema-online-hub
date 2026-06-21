import {
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  ArrayMaxSize,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MovieType } from '../../../common/enums/movie-type.enum';
import { MovieStatus } from '../../../common/enums/movie-status.enum';

// ⚠️ LƯU Ý: kiểm tra lại 2 dòng import enum ở trên cho khớp với
// create-movie.dto.ts của bạn (copy y nguyên dòng import đó nếu đường dẫn khác,
// vì tùy độ sâu thư mục dto/ mà số lượng "../" có thể khác)

export class RandomMovieFilterDto {
  // Loại phim: phim_le | phim_bo | hoat_hinh | anime — không gửi = không lọc loại
  @IsOptional()
  @IsEnum(MovieType)
  type?: MovieType;

  // Trạng thái: ongoing | completed | upcoming — không gửi = không lọc trạng thái
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  // Thể loại — FE gửi dạng "?genreIds=1,2,3" (tối đa 5, kết hợp AND)
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n));
    }
    return value as unknown;
  })
  @IsArray()
  @ArrayMaxSize(5, { message: 'Chỉ được chọn tối đa 5 thể loại' })
  @IsInt({ each: true })
  genreIds?: number[];

  // Số lượng kết quả — chỉ nhận đúng 3 giá trị theo thiết kế FE (radio 5/10/15)
  @IsOptional()
  @Type(() => Number)
  @IsIn([5, 10, 15])
  limit?: number = 10;

  // Tiêu chí sắp xếp kết quả sau khi random — view (xem nhiều) | new (mới) | like | comment
  // (like/comment hiện tạm map về viewCount vì DB chưa có cột đếm riêng)
  @IsOptional()
  @IsIn(['view', 'new', 'like', 'comment'])
  sortBy?: string = 'view';
}
