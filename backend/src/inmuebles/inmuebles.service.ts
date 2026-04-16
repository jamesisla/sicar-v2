import { Injectable, NotFoundException } from '@nestjs/common';
import { InmueblesRepository } from './inmuebles.repository';
import { AuditService } from '../common/audit/audit.service';
import { CreateInmuebleDto, UpdateInmuebleDto } from './dto/inmueble.dto';

@Injectable()
export class InmueblesService {
  constructor(private repo: InmueblesRepository, private audit: AuditService) {}

  async findAll(filters: any) {
    const [rows, total] = await this.repo.findAll(filters);
    return { rows, total };
  }

  async findById(id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('El recurso solicitado no existe');
    return item;
  }

  async create(dto: CreateInmuebleDto, userId: number, ip: string) {
    const result = await this.repo.create(dto, userId);
    await this.audit.log({ idUsuario: userId, entidad: 'INMUEBLE', idRegistro: String(result.id), operacion: 'INSERT', valorNuevo: dto, ipCliente: ip });
    return result;
  }

  async update(id: number, dto: UpdateInmuebleDto, userId: number, ip: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('El recurso solicitado no existe');
    const result = await this.repo.update(id, dto, userId);
    await this.audit.log({ idUsuario: userId, entidad: 'INMUEBLE', idRegistro: String(id), operacion: 'UPDATE', valorAnterior: existing, valorNuevo: dto, ipCliente: ip });
    return result;
  }

  async desactivar(id: number, userId: number, ip: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('El recurso solicitado no existe');
    await this.repo.update(id, { estado: 0 }, userId);
    await this.audit.log({ idUsuario: userId, entidad: 'INMUEBLE', idRegistro: String(id), operacion: 'UPDATE', valorAnterior: { estado: 1 }, valorNuevo: { estado: 0 }, ipCliente: ip });
    return { success: true };
  }
}
