import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

export interface AuditEntry {
  idUsuario?: number;
  entidad: string;
  idRegistro: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  valorAnterior?: object;
  valorNuevo?: object;
  ipCliente?: string;
  endpoint?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.repo.save({
        usuarioId: entry.idUsuario,
        entidad: entry.entidad,
        idRegistro: entry.idRegistro,
        operacion: entry.operacion,
        valorAnterior: entry.valorAnterior ? JSON.stringify(entry.valorAnterior) : null,
        valorNuevo: entry.valorNuevo ? JSON.stringify(entry.valorNuevo) : null,
        ipCliente: entry.ipCliente,
        endpoint: entry.endpoint,
      });
    } catch (err) {
      this.logger.error('Failed to write audit log', err.message);
    }
  }
}
