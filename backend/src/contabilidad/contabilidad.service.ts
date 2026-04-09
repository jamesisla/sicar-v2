import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { ConfigService } from '@nestjs/config';

export class RegistrarContabilizacionDto {
  cuentaDebe: string;
  cuentaHaber: string;
  montoDebe: number;
  montoHaber: number;
  fechaContable: string;
  descripcion?: string;
}

@Injectable()
export class ContabilidadService {
  constructor(private oracle: OracleService, private config: ConfigService) {}

  async buscarDevengos(filters: { fechaDesde?: string; fechaHasta?: string; tipo?: string }) {
    const conditions: string[] = [];
    const binds: any = {};
    if (filters.fechaDesde) { conditions.push('SD.FCHCONTABLE >= TO_DATE(:fechaDesde, \'DD/MM/YYYY\')'); binds.fechaDesde = filters.fechaDesde; }
    if (filters.fechaHasta) { conditions.push('SD.FCHCONTABLE <= TO_DATE(:fechaHasta, \'DD/MM/YYYY\')'); binds.fechaHasta = filters.fechaHasta; }
    if (filters.tipo) { conditions.push('SD.OPCION = :tipo'); binds.tipo = filters.tipo; }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.oracle.executeQuery(
      `SELECT SD.IDSIGFEDEVENGO, SD.FCHCONTABLE, SD.FCHREGISTRO, SD.OPCION, SD.ESTADO
       FROM SIGFEDEVENGO SD ${where} ORDER BY SD.FCHCONTABLE DESC`,
      binds,
    );
  }

  async getDevengo(id: number) {
    const result = await this.oracle.executeQuery(
      `SELECT SD.*, SDD.IDSIGFEDEVENGODETALLE, SDD.MONTO, SDD.ESTADO AS DETALLE_ESTADO
       FROM SIGFEDEVENGO SD
       JOIN SIGFEDEVENGODETALLE SDD ON SDD.IDSIGFEDEVENGOCABECERA = SD.IDSIGFEDEVENGO
       WHERE SD.IDSIGFEDEVENGO = :id`,
      { id },
    );
    return result.rows;
  }

  async registrarDevengo(tipo: 'creacion' | 'ajuste', params: any) {
    // Build devengo with env vars (no hardcoded values — fixes H3)
    const devengoParams = {
      partida: this.config.get('SIGFE_PARTIDA'),
      capitulo: this.config.get('SIGFE_CAPITULO'),
      areaTransaccional: this.config.get('SIGFE_AREA_TRANSACCIONAL'),
      ...params,
    };

    const result = await this.oracle.executeQuery(
      `INSERT INTO SIGFEDEVENGO (FCHCONTABLE, FCHREGISTRO, OPCION, ESTADO)
       VALUES (TO_DATE(:fechaContable, 'DD/MM/YYYY'), SYSDATE, :tipo, 0)
       RETURNING IDSIGFEDEVENGO INTO :id`,
      { fechaContable: params.fechaContable, tipo, id: { dir: 3003, type: 2010 } },
    );

    return { idDevengo: (result.rows[0] as any)?.ID, tipo, params: devengoParams };
  }

  async registrarContabilizacion(dto: RegistrarContabilizacionDto) {
    // Property 4: debe = haber
    if (Math.abs(dto.montoDebe - dto.montoHaber) > 0.001) {
      throw new UnprocessableEntityException('Los montos de debe y haber no coinciden');
    }
    if (dto.montoDebe <= 0) {
      throw new UnprocessableEntityException('Los montos deben ser valores numéricos positivos');
    }

    return this.oracle.executeQuery(
      `INSERT INTO DETALLEASIENTO (ASIENTOSIGFE_ANIOASIENTO, ASIENTOSIGFE_IDASIENTOSIGFE,
        DACODCUENTASIGFE, DAMONTO, DACARGOABONO)
       VALUES (EXTRACT(YEAR FROM SYSDATE), 0, :cuentaDebe, :montoDebe, 1)`,
      { cuentaDebe: dto.cuentaDebe, montoDebe: dto.montoDebe },
    );
  }

  async listarContabilizaciones(filters: any) {
    return this.oracle.executeQuery(
      `SELECT DA.IDDETALLEASIENTO, DA.DACODCUENTASIGFE, DA.DAMONTO, DA.DACARGOABONO,
              DA.ASIENTOSIGFE_ANIOASIENTO
       FROM DETALLEASIENTO DA
       ORDER BY DA.ASIENTOSIGFE_ANIOASIENTO DESC, DA.IDDETALLEASIENTO DESC
       FETCH FIRST 100 ROWS ONLY`,
      {},
    );
  }
}
