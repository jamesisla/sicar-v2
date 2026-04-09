import { Controller, Post, Body, Res, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DocumentosService } from './documentos.service';
import { Response } from 'express';

@ApiTags('documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private service: DocumentosService) {}

  @Post('carta-morosa')
  @ApiOperation({ summary: 'Generar carta morosa en HTML/PDF' })
  async cartaMorosa(@Body() body: { productoId: number }, @Request() req: any, @Res() res: Response) {
    const html = await this.service.generarCartaMorosa(body.productoId, req.user.idUsuario);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="carta-morosa-${body.productoId}.html"`);
    res.send(html);
  }
}
