import { Controller, Post, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PagosService } from './pagos.service';
import { RegistrarAbonoDto, GenerarCuponDto, NotificacionTgrDto, CargaBancoDto } from './dto/pagos.dto';

@ApiTags('pagos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private service: PagosService) {}

  @Post('abonos')
  @ApiOperation({ summary: 'Registrar abono con integración SIGFE' })
  registrarAbono(@Body() dto: RegistrarAbonoDto) { return this.service.registrarAbono(dto); }

  @Post('cupones')
  @ApiOperation({ summary: 'Generar cupón de pago' })
  generarCupon(@Body() dto: GenerarCuponDto, @Request() req: any) {
    return this.service.generarCupon(dto, req.user.idUsuario);
  }

  @Post('carga-banco')
  @ApiOperation({ summary: 'Cargar archivo de pagos Banco Estado' })
  cargarBanco(@Body() dto: CargaBancoDto) { return this.service.cargarBanco(dto); }

  @Post('tgr/notificacion')
  @ApiOperation({ summary: 'Recibir notificación de pago TGR (idempotente)' })
  notificacionTgr(@Body() dto: NotificacionTgrDto) { return this.service.procesarNotificacionTgr(dto); }
}
