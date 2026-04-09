import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto } from './dto/cliente.dto';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private service: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar y buscar clientes' })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post('persona-natural')
  @ApiOperation({ summary: 'Crear cliente persona natural' })
  createPersonaNatural(@Body() dto: CreatePersonaNaturalDto, @Request() req: any) {
    return this.service.createPersonaNatural(dto, req.user.idUsuario, req.ip);
  }

  @Post('persona-juridica')
  @ApiOperation({ summary: 'Crear cliente persona jurídica' })
  createPersonaJuridica(@Body() dto: CreatePersonaJuridicaDto, @Request() req: any) {
    return this.service.createPersonaJuridica(dto, req.user.idUsuario, req.ip);
  }

  @Post(':id/domicilios')
  @ApiOperation({ summary: 'Agregar domicilio a cliente' })
  addDomicilio(@Param('id', ParseIntPipe) id: number, @Body() dto: AddDomicilioDto) {
    return this.service.addDomicilio(id, dto);
  }

  @Post(':id/contactos')
  @ApiOperation({ summary: 'Agregar contacto a cliente' })
  addContacto(@Param('id', ParseIntPipe) id: number, @Body() dto: AddContactoDto) {
    return this.service.addContacto(id, dto);
  }
}
