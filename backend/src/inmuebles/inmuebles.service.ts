import { Injectable, NotFoundException } from '@nestjs/common';
import { InmueblesRepository } from './inmuebles.repository';
import { AuditService } from '../common/audit/audit.service';
import { CreateInmuebleDto } from './dto/inmueble.dto';

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
    await this.audit.log({ idUsuario: userId, entidad: 'INMUEBLE', idRegistro: 'new', operacion: 'INSERT', valorNuevo: dto, ipCliente: ip });
    return result;
  }
}
