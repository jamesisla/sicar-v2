import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto, AddResolucionDto, AddAdjuntoDto, AddFiscalizacionDto, CambiarEstadoDto, PagoManualDto } from './dto/contrato.dto';

@ApiTags('contratos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private service: ContratosService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post()
  create(@Body() dto: CreateContratoDto, @Request() req: any) {
    return this.service.create(dto, req.user.idUsuario, req.ip);
  }

  @Put(':id/estado')
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto, @Request() req: any) {
    return this.service.cambiarEstado(id, dto, req.user.idUsuario, req.ip);
  }

  @Post(':id/resoluciones')
  addResolucion(@Param('id', ParseIntPipe) id: number, @Body() dto: AddResolucionDto) {
    return this.service.addResolucion(id, dto);
  }

  @Post(':id/adjuntos')
  addAdjunto(@Param('id', ParseIntPipe) id: number, @Body() dto: AddAdjuntoDto, @Request() req: any) {
    return this.service.addAdjunto(id, dto, req.user.idUsuario);
  }

  @Post(':id/fiscalizaciones')
  addFiscalizacion(@Param('id', ParseIntPipe) id: number, @Body() dto: AddFiscalizacionDto, @Request() req: any) {
    return this.service.addFiscalizacion(id, dto, req.user.idUsuario);
  }

  @Post(':id/pagos')
  @ApiOperation({ summary: 'Registrar pago manual en cuenta corriente' })
  registrarPago(@Param('id', ParseIntPipe) id: number, @Body() dto: PagoManualDto, @Request() req: any) {
    return this.service.registrarPagoManual(id, dto, req.user.idUsuario, req.ip);
  }
}
