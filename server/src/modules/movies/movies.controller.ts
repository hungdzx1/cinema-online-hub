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
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { RandomMovieFilterDto } from './dto/random-movie-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}
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
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.moviesService.findBySlug(slug);
  }

  // ⚠️ QUAN TRỌNG: 2 route random PHẢI đặt TRƯỚC @Get(':id')
  // Nếu đặt sau, NestJS sẽ hiểu "random" là 1 giá trị :id
  // và gọi nhầm findOne("random") → lỗi
  @Get('random')
  getRandomOne() {
    return this.moviesService.getRandomOne();
  }

  @Get('random/advanced')
  getRandomAdvanced(@Query() filters: RandomMovieFilterDto) {
    return this.moviesService.getRandomAdvanced(filters);
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
