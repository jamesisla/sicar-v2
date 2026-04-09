import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';

@Injectable()
export class DocumentosService {
  constructor(private oracle: OracleService) {}

  async generarCartaMorosa(productoId: number, userId: number): Promise<string> {
    // Get product data
    const result = await this.oracle.executeQuery(
      `SELECT P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, P.PRFCHINICIO, P.PRFCHTERMINO,
              P.PRMONTOTOTAL, C.CLNOMBRE, C.CLRUT, C.CLDV, C.CLFONOCONTACTO,
              I.INNOMBRECALLE, I.INNUMEROCALLE, R.RENOMBRE AS REGION,
              SUM(CU.CUMONTO) AS TOTAL_DEUDA, COUNT(CU.IDCUOTAS) AS NUM_CUOTAS
       FROM PRODUCTO P
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN INMUEBLE I ON I.IDINMUEBLE = P.INMUEBLE_IDINMUEBLE
       JOIN REGION R ON R.IDREGION = P.PRREGION
       LEFT JOIN CUOTA CU ON CU.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO AND CU.ESTADOCUOTA_IDESTADOCUOTA = 3
       WHERE P.IDPRODUCTO = :productoId
       GROUP BY P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, P.PRFCHINICIO, P.PRFCHTERMINO,
                P.PRMONTOTOTAL, C.CLNOMBRE, C.CLRUT, C.CLDV, C.CLFONOCONTACTO,
                I.INNOMBRECALLE, I.INNUMEROCALLE, R.RENOMBRE`,
      { productoId },
    );

    const data = result.rows[0] as any;
    if (!data) throw new UnprocessableEntityException('El producto no existe');
    if (!data.CLNOMBRE) throw new UnprocessableEntityException('Dato faltante: nombre del cliente');
    if (!data.CANUMEROEXPEDIENTE) throw new UnprocessableEntityException('Dato faltante: número de expediente');

    // Register aviso date
    await this.oracle.executeQuery(
      `UPDATE COBRANZA SET COFCHACTUALIZA = SYSDATE, COUSUARIOACTUALIZA = :userId
       WHERE PRODUCTO_IDPRODUCTO = :productoId AND ROWNUM = 1`,
      { userId, productoId },
    );

    // Generate HTML-based PDF content (simplified — in production use puppeteer or pdfkit)
    const fecha = new Date().toLocaleDateString('es-CL');
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Carta Morosa — ${data.CANUMEROEXPEDIENTE}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  .header { text-align: center; margin-bottom: 30px; }
  .section { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .label { font-weight: bold; width: 200px; }
  .total { font-size: 1.2em; font-weight: bold; color: #c00; }
</style>
</head>
<body>
  <div class="header">
    <h2>MINISTERIO DE BIENES NACIONALES</h2>
    <h3>AVISO DE MOROSIDAD</h3>
    <p>Fecha: ${fecha}</p>
  </div>
  <div class="section">
    <h4>Datos del Contrato</h4>
    <table>
      <tr><td class="label">N° Expediente:</td><td>${data.CANUMEROEXPEDIENTE}</td></tr>
      <tr><td class="label">Cliente:</td><td>${data.CLNOMBRE} (RUT: ${data.CLRUT}-${data.CLDV})</td></tr>
      <tr><td class="label">Inmueble:</td><td>${data.INNOMBRECALLE} ${data.INNUMEROCALLE || ''}</td></tr>
      <tr><td class="label">Región:</td><td>${data.REGION}</td></tr>
      <tr><td class="label">Teléfono:</td><td>${data.CLFONOCONTACTO || 'No registrado'}</td></tr>
    </table>
  </div>
  <div class="section">
    <h4>Deuda Actual</h4>
    <table>
      <tr><td class="label">Cuotas vencidas:</td><td>${data.NUM_CUOTAS || 0}</td></tr>
      <tr><td class="label">Total adeudado:</td><td class="total">$${(data.TOTAL_DEUDA || 0).toLocaleString('es-CL')}</td></tr>
    </table>
  </div>
  <p>Se le notifica que debe regularizar su situación de pago a la brevedad.</p>
</body>
</html>`;

    return html;
  }
}
