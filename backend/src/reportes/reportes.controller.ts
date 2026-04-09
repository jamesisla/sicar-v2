import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportesService } from './reportes.service';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Get(':tipo')
  @ApiOperation({ summary: 'Generar reporte (cartera-morosa|convenios|abonos|contabilizaciones)' })
  getReporte(@Param('tipo') tipo: string, @Query() query: any, @Request() req: any) {
    return this.service.getReporte(tipo, query, req.user);
  }
}
