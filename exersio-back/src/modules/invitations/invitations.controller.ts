import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, UpdateInvitationStatusDto } from './dto/invitation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private svc: InvitationsService) {}

  @Get()
  @ApiOperation({ summary: 'List invitations' })
  list(@Req() req: any, @Query() query: any, @Query('page') page = '1', @Query('limit') limit = '10') {
    // Filtrer uniquement les invitations de l'utilisateur connecté
    const userEmail = req.user?.email;
    return this.svc.list(query, parseInt(page, 10), parseInt(limit, 10), userEmail);
  }

  @Post()
  @ApiOperation({ summary: 'Create invitation' })
  create(@Req() req: any, @Body() dto: CreateInvitationDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invitation status' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateInvitationStatusDto) {
    // Passer l'email de l'utilisateur connecté pour l'ajouter au club
    const userEmail = req.user?.email;
    return this.svc.updateStatus(id, dto.status, userEmail);
  }
}
