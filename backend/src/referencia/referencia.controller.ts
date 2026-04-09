import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReferenciaService } from './referencia.service';

@ApiTags('referencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('referencia')
export class ReferenciaController {
  constructor(private service: ReferenciaService) {}

  @Get('ipc') getIPC(@Query() q: any) { return this.service.getIPC(q); }
  @Post('ipc') upsertIPC(@Body() b: any) { return this.service.upsertIPC(b.mes, b.agno, b.valor, b.variacion); }
  @Get('uf') getUF(@Query() q: any) { return this.service.getUF(q); }
  @Post('uf') upsertUF(@Body() b: any) { return this.service.upsertUF(b.fecha, b.valor); }
  @Get('interes-penal') getInteresPenal() { return this.service.getInteresPenal(); }
  @Get('feriados') getFeriados() { return this.service.getFeriados(); }
  @Get('ley-presupuestaria') getLeyPresupuestaria() { return this.service.getLeyPresupuestaria(); }
  @Get('regiones') getRegiones() { return this.service.getRegiones(); }
  @Get('comunas') getComunas(@Query('regionId') regionId: number) { return this.service.getComunas(regionId); }
  @Get('tipos-producto') getTiposProducto() { return this.service.getTiposProducto(); }
  @Get('tipos-uso') getTiposUso() { return this.service.getTiposUso(); }
  @Get('estados-producto') getEstadosProducto() { return this.service.getEstadosProducto(); }
  @Get('estados-cuota') getEstadosCuota() { return this.service.getEstadosCuota(); }
}
