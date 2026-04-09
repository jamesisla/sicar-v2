import { Controller, Get, Post, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CobranzaService } from './cobranza.service';
import { BuscarDeudaQueryDto, RegistrarPagoCarteraDto } from './dto/cobranza.dto';

@ApiTags('cobranza')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cobranza')
export class CobranzaController {
  constructor(private service: CobranzaService) {}

  @Get('deuda')
  @ApiOperation({ summary: 'Buscar deuda por tipo de producto y criterios' })
  buscarDeuda(@Query() query: BuscarDeudaQueryDto, @Request() req: any) {
    return this.service.buscarDeuda(query, req.user);
  }

  @Get('deuda/:productoId')
  @ApiOperation({ summary: 'Situación de deuda de un producto' })
  getSituacionDeuda(@Param('productoId', ParseIntPipe) id: number) {
    return this.service.getSituacionDeuda(id);
  }

  @Get('carteras')
  @ApiOperation({ summary: 'Obtener cartera por tipo (castigada|financiera|venta|concesion)' })
  getCarteras(@Query('tipo') tipo: string, @Request() req: any) {
    return this.service.getCarteras(tipo || 'castigada', req.user);
  }

  @Post('carteras/:id/pago')
  @ApiOperation({ summary: 'Registrar pago en cartera castigada' })
  registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarPagoCarteraDto,
  ) {
    return this.service.registrarPagoCartera(id, dto.fechaDocumento, dto.monto, dto.numeroDocumento);
  }

  @Post(':productoId/avisos')
  @ApiOperation({ summary: 'Generar aviso de cobranza' })
  generarAviso(@Param('productoId', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.generarAviso(id, req.user.idUsuario);
  }

  @Post(':productoId/cde')
  @ApiOperation({ summary: 'Enviar contrato al CDE' })
  enviarCDE(@Param('productoId', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.enviarCDE(id, req.user.idUsuario);
  }

  @Get('convenios')
  @ApiOperation({ summary: 'Buscar convenios de pago' })
  buscarConvenios(@Query() query: any, @Request() req: any) {
    return this.service.buscarConvenios(query, req.user);
  }
}
