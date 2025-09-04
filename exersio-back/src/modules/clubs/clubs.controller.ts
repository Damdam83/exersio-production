import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto } from './dto/club.dto';
import { AuthorizationService } from '../../common/auth/authorization.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('clubs')
@ApiBearerAuth()
@Controller('clubs')
@UseGuards(JwtAuthGuard)
export class ClubsController {
  constructor(private clubs: ClubsService, private authz: AuthorizationService) {}

  @Get()
  @ApiOperation({ summary: 'List clubs' })
  list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.clubs.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Post()
  @ApiOperation({ summary: 'Create club' })
  create(@Req() req: any, @Body() dto: CreateClubDto) {
    return this.clubs.create(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get club by id' })
  get(@Param('id') id: string) {
    return this.clubs.get(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update club (admin or owner)' })
  async update(@Param('id') id: string, @Body() dto: UpdateClubDto, @Req() req: any) {
    await this.authz.assertAdminOrClubOwner(req.user, id);
    return this.clubs.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete club (admin or owner)' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.authz.assertAdminOrClubOwner(req.user, id);
    return this.clubs.delete(id);
  }
}
