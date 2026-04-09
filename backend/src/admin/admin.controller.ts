import { Controller, Get, Post, Put, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('usuarios') getUsuarios() { return this.service.getUsuarios(); }
  @Post('usuarios') createUsuario(@Body() dto: any) { return this.service.createUsuario(dto); }
  @Put('usuarios/:id/desactivar') desactivar(@Param('id', ParseIntPipe) id: number) { return this.service.desactivarUsuario(id); }
  @Get('perfiles') getPerfiles() { return this.service.getPerfiles(); }
  @Get('opciones') getOpciones() { return this.service.getOpciones(); }
  @Get('permisos/:perfilId') getPermisos(@Param('perfilId', ParseIntPipe) id: number) { return this.service.getPermisos(id); }
  @Get('sigfe/unidades') getUnidades() { return this.service.getUnidadesSigfe(); }
  @Get('sigfe/cuentas') getCuentas() { return this.service.getCuentasSigfe(); }
  @Get('seremi') getSeremi() { return this.service.getSeremi(); }
}
