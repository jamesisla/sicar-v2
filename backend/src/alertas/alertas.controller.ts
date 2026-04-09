import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AlertasService } from './alertas.service';

@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private service: AlertasService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard de alertas perfilado por región del usuario' })
  getDashboard(@Request() req: any) { return this.service.getDashboard(req.user); }
}
