import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CodigosBarraService } from './codigos-barra.service';
import { Response } from 'express';

@ApiTags('codigos-barra')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('codigos-barra')
export class CodigosBarraController {
  constructor(private service: CodigosBarraService) {}

  @Get()
  @ApiOperation({ summary: 'Generar código de barra (code128|i2of5) — retorna SVG sin persistir en disco' })
  generate(
    @Query('codigo') codigo: string,
    @Query('formato') formato: 'code128' | 'i2of5' = 'code128',
    @Query('ancho') ancho: number = 2,
    @Query('alto') alto: number = 100,
    @Query('texto') texto: string = 'true',
    @Res() res: Response,
  ) {
    const svg = this.service.generateBarcode({
      codigo, formato, ancho: Number(ancho), alto: Number(alto),
      mostrarTexto: texto !== 'false',
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.send(svg);
  }
}
