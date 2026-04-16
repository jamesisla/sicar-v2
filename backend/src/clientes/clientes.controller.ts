import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto, UpdateClienteDto } from './dto/cliente.dto';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private service: ClientesService) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post('persona-natural')
  createPersonaNatural(@Body() dto: CreatePersonaNaturalDto, @Request() req: any) {
    return this.service.createPersonaNatural(dto, req.user.idUsuario, req.ip);
  }

  @Post('persona-juridica')
  createPersonaJuridica(@Body() dto: CreatePersonaJuridicaDto, @Request() req: any) {
    return this.service.createPersonaJuridica(dto, req.user.idUsuario, req.ip);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del cliente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.idUsuario, req.ip);
  }

  @Put(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar cliente' })
  desactivar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.desactivar(id, req.user.idUsuario, req.ip);
  }

  @Post(':id/domicilios')
  addDomicilio(@Param('id', ParseIntPipe) id: number, @Body() dto: AddDomicilioDto) {
    return this.service.addDomicilio(id, dto);
  }

  @Delete(':id/domicilios/:domicilioId')
  @ApiOperation({ summary: 'Eliminar domicilio' })
  deleteDomicilio(@Param('id', ParseIntPipe) id: number, @Param('domicilioId', ParseIntPipe) domicilioId: number) {
    return this.service.deleteDomicilio(id, domicilioId);
  }

  @Post(':id/contactos')
  addContacto(@Param('id', ParseIntPipe) id: number, @Body() dto: AddContactoDto) {
    return this.service.addContacto(id, dto);
  }

  @Delete(':id/contactos/:contactoId')
  @ApiOperation({ summary: 'Eliminar contacto' })
  deleteContacto(@Param('id', ParseIntPipe) id: number, @Param('contactoId', ParseIntPipe) contactoId: number) {
    return this.service.deleteContacto(id, contactoId);
  }
}
