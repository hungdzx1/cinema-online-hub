import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { RandomMovieFilterDto } from './dto/random-movie-filter.dto';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthGuard } from '@nestjs/passport';
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }
  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.moviesService.findAllAdmin();
  }

  // @UseGuards(AuthGuard('jwt')) // Tự động chặn và kiểm tra JWT trong cookie
  // @Get('profile')
  // getProfile(@Request() req: any) {
  //   // Lấy thông tin user đã đăng nhập từ req.user
  //   return { user: req.user };
  // }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.moviesService.findBySlug(slug);
  }

  @Get('detail/:slug')
  getMovieDetail(@Param('slug') slug: string) {
    return this.moviesService.getMovieDetail(slug);
  }

  // ⚠️ Tất cả route TĨNH (random, filter) PHẢI đặt TRƯỚC @Get(':id')
  // nếu không NestJS sẽ hiểu "random"/"filter" là 1 giá trị :id → gọi nhầm findOne
  @Get('random')
  getRandomOne() {
    return this.moviesService.getRandomOne();
  }

  @Get('random/advanced')
  getRandomAdvanced(@Query() filters: RandomMovieFilterDto) {
    return this.moviesService.getRandomAdvanced(filters);
  }

  @Get('filter')
  filterMovies(@Query() filters: FilterMovieDto) {
    return this.moviesService.filterMovies(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}
