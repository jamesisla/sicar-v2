import { Controller, Get, Post, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto } from './dto/inmueble.dto';

@ApiTags('inmuebles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inmuebles')
export class InmueblesController {
  constructor(private service: InmueblesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar y buscar inmuebles' })
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener inmueble por ID' })
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post()
  @ApiOperation({ summary: 'Crear inmueble' })
  create(@Body() dto: CreateInmuebleDto, @Request() req: any) {
    return this.service.create(dto, req.user.idUsuario, req.ip);
  }
}
