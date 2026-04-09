import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto, AddResolucionDto, AddAdjuntoDto, AddFiscalizacionDto, CambiarEstadoDto } from './dto/contrato.dto';

@ApiTags('contratos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private service: ContratosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contrato por ID' })
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post()
  @ApiOperation({ summary: 'Crear contrato' })
  create(@Body() dto: CreateContratoDto, @Request() req: any) {
    return this.service.create(dto, req.user.idUsuario, req.ip);
  }

  @Put(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado del contrato' })
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoDto, @Request() req: any) {
    return this.service.cambiarEstado(id, dto, req.user.idUsuario, req.ip);
  }

  @Post(':id/resoluciones')
  @ApiOperation({ summary: 'Agregar resolución al contrato' })
  addResolucion(@Param('id', ParseIntPipe) id: number, @Body() dto: AddResolucionDto) {
    return this.service.addResolucion(id, dto);
  }

  @Post(':id/adjuntos')
  @ApiOperation({ summary: 'Adjuntar documento al contrato' })
  addAdjunto(@Param('id', ParseIntPipe) id: number, @Body() dto: AddAdjuntoDto, @Request() req: any) {
    return this.service.addAdjunto(id, dto, req.user.idUsuario);
  }

  @Post(':id/fiscalizaciones')
  @ApiOperation({ summary: 'Registrar fiscalización' })
  addFiscalizacion(@Param('id', ParseIntPipe) id: number, @Body() dto: AddFiscalizacionDto, @Request() req: any) {
    return this.service.addFiscalizacion(id, dto, req.user.idUsuario);
  }
}
