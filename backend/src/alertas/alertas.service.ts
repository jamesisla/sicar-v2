import { Injectable } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';

@Injectable()
export class AlertasService {
  constructor(private oracle: OracleService) {}

  async getDashboard(user: any) {
    const regionFilter = user.region !== 90 ? 'AND P.PRREGION = :region' : '';
    const binds: any = user.region !== 90 ? { region: user.region } : {};

    const [sinAceptar, porTerminar, paraCDE, cuotasVencidas, avisosPendientes, oficiosCDE, enCDESinCerrar] = await Promise.all([
      // Contratos sin aceptar (en proceso, 15+ días)
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM PRODUCTO P
         JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
         WHERE P.ESTADOPRODUCTO_IDESTADOP = 1
         AND CA.CAACEPTACIONCLIENTE IS NULL
         AND (SYSDATE - P.PRFCHINICIO) >= 15 ${regionFilter}`,
        binds,
      ),
      // Contratos por terminar (próximos 90 días)
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM PRODUCTO P
         WHERE P.ESTADOPRODUCTO_IDESTADOP IN (1, 5)
         AND P.PRFCHTERMINO BETWEEN SYSDATE AND SYSDATE + 90 ${regionFilter}`,
        binds,
      ),
      // Contratos para CDE (3er aviso, 7+ días)
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM COBRANZA CO
         JOIN PRODUCTO P ON P.IDPRODUCTO = CO.PRODUCTO_IDPRODUCTO
         JOIN CARTAAVISO AV ON AV.COBRANZA_IDCOBRANZA = CO.IDCOBRANZA
         WHERE AV.TIPOCOBRANZA_IDTIPOCOBRANZA = 3
         AND (SYSDATE - AV.CAFCH_AVISO) >= 7
         AND P.ESTADOPRODUCTO_IDESTADOP = 5 ${regionFilter}`,
        binds,
      ),
      // Cuotas vencidas sin aviso
      this.oracle.executeQuery(
        `SELECT COUNT(DISTINCT P.IDPRODUCTO) AS CNT FROM CUOTA CU
         JOIN PRODUCTO P ON P.IDPRODUCTO = CU.PRODUCTO_IDPRODUCTO
         WHERE CU.ESTADOCUOTA_IDESTADOCUOTA = 3
         AND CU.CUAVISOCOBRANZA IS NULL ${regionFilter}`,
        binds,
      ),
      // Avisos pendientes (plazo vencido)
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM COBRANZA CO
         JOIN PRODUCTO P ON P.IDPRODUCTO = CO.PRODUCTO_IDPRODUCTO
         JOIN CARTAAVISO AV ON AV.COBRANZA_IDCOBRANZA = CO.IDCOBRANZA
         WHERE AV.TIPOCOBRANZA_IDTIPOCOBRANZA < 3
         AND (SYSDATE - AV.CAFCH_AVISO) >= 15
         AND P.ESTADOPRODUCTO_IDESTADOP = 5 ${regionFilter}`,
        binds,
      ),
      // Oficios CDE por enviar
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM PRODUCTO P
         WHERE P.ESTADOPRODUCTO_IDESTADOP = 5
         AND NOT EXISTS (SELECT 1 FROM ADJUNTOPRODUCTO AP WHERE AP.IDPRODUCTO = P.IDPRODUCTO AND AP.APNROOFICIOCDE IS NOT NULL)
         AND EXISTS (SELECT 1 FROM COBRANZA CO JOIN CARTAAVISO AV ON AV.COBRANZA_IDCOBRANZA = CO.IDCOBRANZA WHERE CO.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO AND AV.TIPOCOBRANZA_IDTIPOCOBRANZA = 3) ${regionFilter}`,
        binds,
      ),
      // Contratos en CDE sin cerrar
      this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM PRODUCTO P
         WHERE P.ESTADOPRODUCTO_IDESTADOP = 6
         AND NOT EXISTS (SELECT 1 FROM PRODRESOL PR WHERE PR.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO AND PR.PRCAUSALTERMINO IS NOT NULL) ${regionFilter}`,
        binds,
      ),
    ]);

    return {
      sinAceptar: (sinAceptar.rows[0] as any)?.CNT || 0,
      porTerminar: (porTerminar.rows[0] as any)?.CNT || 0,
      paraCDE: (paraCDE.rows[0] as any)?.CNT || 0,
      cuotasVencidas: (cuotasVencidas.rows[0] as any)?.CNT || 0,
      avisosPendientes: (avisosPendientes.rows[0] as any)?.CNT || 0,
      oficiosCDE: (oficiosCDE.rows[0] as any)?.CNT || 0,
      enCDESinCerrar: (enCDESinCerrar.rows[0] as any)?.CNT || 0,
    };
  }
}
