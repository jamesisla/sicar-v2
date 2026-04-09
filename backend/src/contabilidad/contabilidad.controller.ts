import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContabilidadService, RegistrarContabilizacionDto } from './contabilidad.service';

@ApiTags('contabilidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contabilidad')
export class ContabilidadController {
  constructor(private service: ContabilidadService) {}

  @Get('devengos')
  @ApiOperation({ summary: 'Buscar devengos por rango de fechas' })
  buscarDevengos(@Query() query: any) { return this.service.buscarDevengos(query); }

  @Get('devengos/:id')
  @ApiOperation({ summary: 'Obtener devengo por ID' })
  getDevengo(@Param('id', ParseIntPipe) id: number) { return this.service.getDevengo(id); }

  @Post('devengos/creacion')
  @ApiOperation({ summary: 'Registrar devengo de creación' })
  registrarDevengoCreacion(@Body() body: any) { return this.service.registrarDevengo('creacion', body); }

  @Post('devengos/ajuste')
  @ApiOperation({ summary: 'Registrar devengo de ajuste' })
  registrarDevengoAjuste(@Body() body: any) { return this.service.registrarDevengo('ajuste', body); }

  @Get('contabilizaciones')
  @ApiOperation({ summary: 'Listar contabilizaciones' })
  listar(@Query() query: any) { return this.service.listarContabilizaciones(query); }

  @Post('contabilizaciones')
  @ApiOperation({ summary: 'Registrar contabilización (valida debe = haber)' })
  registrar(@Body() dto: RegistrarContabilizacionDto) { return this.service.registrarContabilizacion(dto); }
}
