import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('exercise-categories')
  @ApiOperation({ summary: 'Get all exercise categories' })
  getExerciseCategories() {
    return this.categoriesService.getExerciseCategories();
  }

  @Get('age-categories')
  @ApiOperation({ summary: 'Get all age categories' })
  getAgeCategories() {
    return this.categoriesService.getAgeCategories();
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all skill levels' })
  getLevels() {
    return this.categoriesService.getLevels();
  }
}