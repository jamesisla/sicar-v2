import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';

@Injectable()
export class ReferenciaService {
  constructor(private oracle: OracleService) {}

  // IPC
  getIPC(filters: any) {
    return this.oracle.executeQuery('SELECT * FROM INDICE_IPC ORDER BY AGNO DESC, MES DESC', {});
  }
  upsertIPC(mes: number, agno: number, valor: number, variacion: number) {
    return this.oracle.executeQuery(
      `MERGE INTO INDICE_IPC USING DUAL ON (MES = :mes AND AGNO = :agno)
       WHEN MATCHED THEN UPDATE SET VALOR_INDICE = :valor, VARIACION = :variacion
       WHEN NOT MATCHED THEN INSERT (MES, AGNO, VALOR_INDICE, VARIACION) VALUES (:mes, :agno, :valor, :variacion)`,
      { mes, agno, valor, variacion },
    );
  }

  // UF
  getUF(filters: any) {
    return this.oracle.executeQuery('SELECT * FROM VALOR_UF ORDER BY FECHA DESC FETCH FIRST 30 ROWS ONLY', {});
  }
  upsertUF(fecha: string, valor: number) {
    return this.oracle.executeQuery(
      `MERGE INTO VALOR_UF USING DUAL ON (FECHA = TO_DATE(:fecha, 'DD/MM/YYYY'))
       WHEN MATCHED THEN UPDATE SET VALOR = :valor
       WHEN NOT MATCHED THEN INSERT (FECHA, VALOR) VALUES (TO_DATE(:fecha, 'DD/MM/YYYY'), :valor)`,
      { fecha, valor },
    );
  }

  // Interés penal
  getInteresPenal() {
    return this.oracle.executeQuery('SELECT * FROM INTERESPENAL ORDER BY IP_YEAR DESC, IP_MES DESC', {});
  }

  // Feriados
  getFeriados() {
    return this.oracle.executeQuery('SELECT * FROM FERIADO ORDER BY FMES, FDIA', {});
  }

  // Ley presupuestaria
  getLeyPresupuestaria() {
    return this.oracle.executeQuery('SELECT * FROM LEYPRESUPUESTARIA ORDER BY ID', {});
  }

  // Property 10: get index for specific date
  async getIndiceParaFecha(fecha: string, tipoBase: number): Promise<number> {
    let result: any;
    if (tipoBase === 1) { // IPC
      const [d, m, y] = fecha.split('/').map(Number);
      result = await this.oracle.executeQuery(
        'SELECT VALOR_INDICE FROM INDICE_IPC WHERE MES = :mes AND AGNO = :agno',
        { mes: m, agno: y },
      );
    } else { // UF
      result = await this.oracle.executeQuery(
        'SELECT VALOR FROM VALOR_UF WHERE FECHA = TO_DATE(:fecha, \'DD/MM/YYYY\')',
        { fecha },
      );
    }
    const row = result.rows[0] as any;
    if (!row) {
      throw new UnprocessableEntityException(
        `No existe índice ${tipoBase === 1 ? 'IPC' : 'UF'} para la fecha ${fecha}`,
      );
    }
    return row.VALOR_INDICE || row.VALOR;
  }

  // Tablas de referencia
  getRegiones() { return this.oracle.executeQuery('SELECT * FROM REGION ORDER BY IDREGION', {}); }
  getComunas(regionId?: number) {
    const where = regionId ? 'WHERE REGION_IDREGION = :regionId' : '';
    return this.oracle.executeQuery(`SELECT * FROM COMUNA ${where} ORDER BY CONOMBRE`, regionId ? { regionId } : {});
  }
  getTiposProducto() { return this.oracle.executeQuery('SELECT * FROM TIPOPRODUCTO', {}); }
  getTiposUso() { return this.oracle.executeQuery('SELECT * FROM TIPOUSO', {}); }
  getTiposCobranza() { return this.oracle.executeQuery('SELECT * FROM TIPOCOBRANZA', {}); }
  getEstadosProducto() { return this.oracle.executeQuery('SELECT * FROM ESTADOPRODUCTO', {}); }
  getEstadosCuota() { return this.oracle.executeQuery('SELECT * FROM ESTADOCUOTA', {}); }
}
