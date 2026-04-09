import { Injectable, Logger } from '@nestjs/common';
import { OracleService } from '../oracle/oracle.service';

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

  constructor(private oracle: OracleService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.oracle.executeQuery(
        `INSERT INTO AUDIT_LOG (IDUSUARIO, ENTIDAD, IDREGISTRO, OPERACION, VALORANTERIOR, VALORNUEVO, IPCLIENTE, ENDPOINT)
         VALUES (:idUsuario, :entidad, :idRegistro, :operacion, :valorAnterior, :valorNuevo, :ipCliente, :endpoint)`,
        {
          idUsuario: entry.idUsuario || null,
          entidad: entry.entidad,
          idRegistro: entry.idRegistro,
          operacion: entry.operacion,
          valorAnterior: entry.valorAnterior ? JSON.stringify(entry.valorAnterior) : null,
          valorNuevo: entry.valorNuevo ? JSON.stringify(entry.valorNuevo) : null,
          ipCliente: entry.ipCliente || null,
          endpoint: entry.endpoint || null,
        },
      );
    } catch (err) {
      // Audit failures should not break the main operation
      this.logger.error('Failed to write audit log', err.message);
    }
  }
}
