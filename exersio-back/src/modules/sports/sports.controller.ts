import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { Sport } from '@prisma/client';

@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les sports disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des sports récupérée avec succès' })
  async getSports(): Promise<Sport[]> {
    return this.sportsService.getSports();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Récupérer un sport par son slug' })
  @ApiResponse({ status: 200, description: 'Sport récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Sport non trouvé' })
  async getSportBySlug(@Param('slug') slug: string): Promise<Sport | null> {
    return this.sportsService.getSportBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un sport par son ID' })
  @ApiResponse({ status: 200, description: 'Sport récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Sport non trouvé' })
  async getSportById(@Param('id') id: string): Promise<Sport | null> {
    return this.sportsService.getSportById(id);
  }
}
