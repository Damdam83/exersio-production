import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { AuthorizationService } from '../../common/auth/authorization.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private ex: ExercisesService, private authz: AuthorizationService) {}

  @Get()
  @ApiOperation({ summary: 'List exercises' })
  list(@Query() query: any, @Query('page') page = '1', @Query('limit') limit = '10', @Req() req: any) {
    return this.ex.list(query, parseInt(page, 10), parseInt(limit, 10), req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create exercise' })
  create(@Req() req: any, @Body() dto: CreateExerciseDto) {
    return this.ex.create(req.user.id, dto);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user permissions for exercise' })
  async getPermissions(@Param('id') id: string, @Req() req: any) {
    const [canEdit, canDelete] = await Promise.all([
      this.ex.canEdit(id, req.user.id),
      this.ex.canDelete(id, req.user.id)
    ]);
    return { canEdit, canDelete };
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share exercise with club' })
  async shareWithClub(@Param('id') id: string, @Req() req: any) {
    return this.ex.shareWithClub(id, req.user.id);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get exercise by id' })
  get(@Param('id') id: string, @Req() req: any) {
    return this.ex.get(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exercise (admin/creator only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateExerciseDto, @Req() req: any) {
    const canEdit = await this.ex.canEdit(id, req.user.id);
    if (!canEdit) {
      throw new Error('Vous ne pouvez modifier que vos propres exercices');
    }
    return this.ex.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exercise (creator/club owner only)' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const canDelete = await this.ex.canDelete(id, req.user.id);
    if (!canDelete) {
      throw new Error('Vous ne pouvez supprimer que vos exercices ou ceux de votre club si vous êtes responsable');
    }
    return this.ex.delete(id);
  }
}
