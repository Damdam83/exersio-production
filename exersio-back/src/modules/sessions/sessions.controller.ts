import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';
import { AuthorizationService } from '../../common/auth/authorization.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private svc: SessionsService, private authz: AuthorizationService) {}

  @Get()
  @ApiOperation({ summary: 'List sessions' })
  list(@Query() query: any, @Query('page') page = '1', @Query('limit') limit = '10', @Req() req: any) {
    return this.svc.list(query, parseInt(page, 10), parseInt(limit, 10), req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create session' })
  create(@Req() req: any, @Body() dto: CreateSessionDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by id' })
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update session (admin/creator/club owner)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSessionDto, @Req() req: any) {
    const resource = await this.svc.get(id);
    await this.authz.assertAdminOrResourceOwner(req.user, resource);
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete session (admin/creator/club owner)' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const resource = await this.svc.get(id);
    await this.authz.assertAdminOrResourceOwner(req.user, resource);
    return this.svc.delete(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate session' })
  async duplicate(@Param('id') id: string, @Req() req: any) {
    const resource = await this.svc.get(id);
    await this.authz.assertAdminOrResourceOwner(req.user, resource);
    return this.svc.duplicate(id, req.user.id);
  }
}
