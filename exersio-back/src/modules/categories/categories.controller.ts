import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('exercise-categories')
  @ApiOperation({ summary: 'Get all exercise categories (optionally filtered by sport)' })
  @ApiQuery({ name: 'sportId', required: false, description: 'Filter by sport ID' })
  getExerciseCategories(@Query('sportId') sportId?: string) {
    return this.categoriesService.getExerciseCategories(sportId);
  }

  @Get('age-categories')
  @ApiOperation({ summary: 'Get all age categories (optionally filtered by sport)' })
  @ApiQuery({ name: 'sportId', required: false, description: 'Filter by sport ID' })
  getAgeCategories(@Query('sportId') sportId?: string) {
    return this.categoriesService.getAgeCategories(sportId);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get all skill levels' })
  getLevels() {
    return this.categoriesService.getLevels();
  }
}