import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List users (admin)' })
  list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.users.list(parseInt(page, 10), parseInt(limit, 10));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create user (admin)' })
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  get(@Param('id') id: string) { return this.users.get(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by id (self or admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) { return this.users.update(req.user, id, dto); }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (admin)' })
  delete(@Param('id') id: string) { return this.users.delete(id); }
}
