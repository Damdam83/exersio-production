import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('user/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get('exercises')
  async getFavorites(@Request() req: any) {
    const favorites = await this.favoritesService.getFavorites(req.user.id);
    return favorites;
  }

  @Post('exercises')
  async addFavorite(@Request() req: any, @Body() body: { exerciseId: string }) {
    return this.favoritesService.addFavorite(req.user.id, body.exerciseId);
  }

  @Delete('exercises/:exerciseId')
  async removeFavorite(@Request() req: any, @Param('exerciseId') exerciseId: string) {
    return this.favoritesService.removeFavorite(req.user.id, exerciseId);
  }
}