import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto, UpdateInmuebleDto } from './dto/inmueble.dto';

@ApiTags('inmuebles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inmuebles')
export class InmueblesController {
  constructor(private service: InmueblesService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post()
  create(@Body() dto: CreateInmuebleDto, @Request() req: any) {
    return this.service.create(dto, req.user.idUsuario, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar inmueble' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInmuebleDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.idUsuario, req.ip);
  }

  @Put(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar inmueble' })
  desactivar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.desactivar(id, req.user.idUsuario, req.ip);
  }
}
