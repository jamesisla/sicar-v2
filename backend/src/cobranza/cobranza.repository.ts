import { Injectable } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';

@Injectable()
export class CobranzaRepository {
  constructor(private oracle: OracleService) {}

  async buscarDeuda(filters: any, userRegion: number) {
    const conditions: string[] = ['P.ESTADOPRODUCTO_IDESTADOP = 5', 'P.TIPOPRODUCTO_IDTIPOPRODUCTO = :tipoProducto'];
    const binds: any = { tipoProducto: filters.tipoProducto };

    // Property 2: filtrado regional automático
    if (userRegion !== 90) { conditions.push('P.PRREGION = :region'); binds.region = userRegion; }
    else if (filters.region) { conditions.push('P.PRREGION = :region'); binds.region = filters.region; }

    // Property 3: todos los criterios con AND (nunca sobreescribir)
    if (filters.rut) { conditions.push('C.CLRUT = :rut'); binds.rut = filters.rut; }
    if (filters.nombre) { conditions.push('UPPER(C.CLNOMBRE) LIKE UPPER(:nombre)'); binds.nombre = `%${filters.nombre}%`; }
    if (filters.expediente) { conditions.push('CA.CANUMEROEXPEDIENTE = :expediente'); binds.expediente = filters.expediente; }
    if (filters.carpeta) { conditions.push('I.INCARPETA = :carpeta'); binds.carpeta = filters.carpeta; }
    if (filters.porcion) { conditions.push('I.INPORCION = :porcion'); binds.porcion = filters.porcion; }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    binds.offset = (page - 1) * pageSize;
    binds.pageSize = pageSize;

    return this.oracle.executeQuery(
      `SELECT P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, P.PRFCHINICIO, P.PRFCHTERMINO,
              P.PRMONTOTOTAL, P.PRREGION, C.CLNOMBRE, C.CLRUT, C.CLDV,
              C.CLFONOCONTACTO, I.INNOMBRECALLE, I.INNUMEROCALLE,
              EP.EPNOMBRE AS ESTADO
       FROM PRODUCTO P
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN INMUEBLE I ON I.IDINMUEBLE = P.INMUEBLE_IDINMUEBLE
       JOIN ESTADOPRODUCTO EP ON EP.IDESTADOPRODUCTO = P.ESTADOPRODUCTO_IDESTADOP
       WHERE ${conditions.join(' AND ')}
       ORDER BY CA.CANUMEROEXPEDIENTE
       OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      binds,
    );
  }

  async getSituacionDeuda(productoId: number) {
    return this.oracle.executeStoredProcedure('PA_SELCUENTACTE01', {
      p_idproducto: { val: productoId, dir: 3001 },
      p_cursor: { dir: 3003, type: 2021 }, // REF CURSOR out
    });
  }

  async getCuentaCorriente(productoId: number) {
    return this.oracle.executeQuery(
      `SELECT CC.IDCUENTACORRIENTE, CC.CCFCHMOVIMIENTO, CC.CCMONTOMOV,
              CC.CCCARGOABONO, CC.CCIDCUOTA, TM.TMNOMBRE AS TIPO_MOVIMIENTO
       FROM CUENTACORRIENTE CC
       JOIN TIPOMOVIMIENTO TM ON TM.IDTIPOMOVIMIENTO = CC.TIPOMOVIMIENTO_IDTIPOMOV
       WHERE CC.PRODUCTO_IDPRODUCTO = :productoId
       ORDER BY CC.CCFCHMOVIMIENTO ASC`,
      { productoId },
    );
  }

  async getCuotas(productoId: number) {
    return this.oracle.executeQuery(
      `SELECT CU.IDCUOTAS, CU.CUFCHVENCIMIENTO, CU.CUMONTO,
              CU.CUMONTOREAVALUO, CU.CUCARGOREAVALUO, CU.CUCARGOINTERES,
              CU.CUCARGOCONVENIO, CU.CUABONOPAGO, CU.CUFCHPAGO,
              EC.ECNOMBRE AS ESTADO
       FROM CUOTA CU
       JOIN ESTADOCUOTA EC ON EC.IDESTADOCUOTA = CU.ESTADOCUOTA_IDESTADOCUOTA
       WHERE CU.PRODUCTO_IDPRODUCTO = :productoId
       ORDER BY CU.CUFCHVENCIMIENTO ASC`,
      { productoId },
    );
  }

  async getCarteras(tipo: string, userRegion: number) {
    const tipoMap: any = { castigada: { coestado: 3, tipoCobranza: 4, estadoProd: 6 }, financiera: { coestado: 1, tipoCobranza: 2, estadoProd: 5 }, venta: { coestado: 1, tipoCobranza: 2, estadoProd: 5, tipoProducto: 2 }, concesion: { coestado: 1, tipoCobranza: 2, estadoProd: 5, tipoProducto: 3 } };
    const cfg = tipoMap[tipo] || tipoMap.castigada;
    const binds: any = { coestado: cfg.coestado, tipoCobranza: cfg.tipoCobranza, estadoProd: cfg.estadoProd };
    const conditions = ['CO.COESTADO = :coestado', 'CO.TIPOCOBRANZA_IDTIPOCOBRANZA = :tipoCobranza', 'P.ESTADOPRODUCTO_IDESTADOP = :estadoProd'];
    if (cfg.tipoProducto) { conditions.push('P.TIPOPRODUCTO_IDTIPOPRODUCTO = :tipoProducto'); binds.tipoProducto = cfg.tipoProducto; }
    if (userRegion !== 90) { conditions.push('P.PRREGION = :region'); binds.region = userRegion; }

    return this.oracle.executeQuery(
      `SELECT CO.IDCOBRANZA, CO.COFCHCOBRANZA, CO.COESTADO, CO.COMONTOCOBRADO,
              P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, C.CLNOMBRE, C.CLFONOCONTACTO,
              TC.TCNOMBRE AS TIPO_COBRANZA,
              (SELECT MAX(AV.CAFCH_AVISO) FROM CARTAAVISO AV WHERE AV.COBRANZA_IDCOBRANZA = CO.IDCOBRANZA) AS FECHA_AVISO,
              (SELECT SUM(CU.CUMONTO) FROM CUOTA CU WHERE CU.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO AND CU.ESTADOCUOTA_IDESTADOCUOTA = 3) AS TOTAL_CUOTAS
       FROM COBRANZA CO
       JOIN PRODUCTO P ON P.IDPRODUCTO = CO.PRODUCTO_IDPRODUCTO
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN TIPOCOBRANZA TC ON TC.IDTIPOCOBRANZA = CO.TIPOCOBRANZA_IDTIPOCOBRANZA
       WHERE ${conditions.join(' AND ')}
       ORDER BY FECHA_AVISO ASC NULLS LAST`,
      binds,
    );
  }

  async registrarPagoCartera(cobranzaId: number, fechaDoc: string, monto: number, nroDoc: number) {
    return this.oracle.executeStoredProcedure('PA_TERMINACDE01', {
      p_idcobranza: { val: cobranzaId, dir: 3001 },
      p_fechadocumento: { val: fechaDoc, dir: 3001 },
      p_monto: { val: monto, dir: 3001 },
      p_nrodocumento: { val: nroDoc, dir: 3001 },
      VAR_VALIDA: { dir: 3003, type: 2010 },
      VAR_MENSAJE: { dir: 3003, type: 2001, maxSize: 200 },
    });
  }

  async getUltimoAviso(productoId: number) {
    const result = await this.oracle.executeQuery(
      `SELECT CO.IDCOBRANZA, AV.CAFCH_AVISO, AV.TIPOCOBRANZA_IDTIPOCOBRANZA AS NUMERO_AVISO
       FROM COBRANZA CO
       JOIN CARTAAVISO AV ON AV.COBRANZA_IDCOBRANZA = CO.IDCOBRANZA
       WHERE CO.PRODUCTO_IDPRODUCTO = :productoId
       ORDER BY AV.CAFCH_AVISO DESC
       FETCH FIRST 1 ROWS ONLY`,
      { productoId },
    );
    return result.rows[0] as any;
  }

  async registrarAviso(productoId: number, cobranzaId: number, numeroAviso: number, userId: number) {
    await this.oracle.executeQuery(
      `INSERT INTO CARTAAVISO (COBRANZA_IDCOBRANZA, TIPOCOBRANZA_IDTIPOCOBRANZA, CAFCH_AVISO, ACUSUARIOAVISO)
       VALUES (:cobranzaId, :numeroAviso, SYSDATE, :userId)`,
      { cobranzaId, numeroAviso, userId },
    );
  }

  async enviarCDE(productoId: number, userId: number) {
    await this.oracle.executeQuery(
      `UPDATE PRODUCTO SET ESTADOPRODUCTO_IDESTADOP = 6, PRFCHACTUALIZA = SYSDATE, PFUSUARIOACTUALIZA = :userId
       WHERE IDPRODUCTO = :productoId`,
      { userId, productoId },
    );
  }

  async buscarConvenios(filters: any, userRegion: number) {
    const conditions: string[] = ['CU.ESTADOCUOTA_IDESTADOCUOTA = 4'];
    const binds: any = {};
    if (userRegion !== 90) { conditions.push('P.PRREGION = :region'); binds.region = userRegion; }
    if (filters.rut) { conditions.push('C.CLRUT = :rut'); binds.rut = filters.rut; }
    if (filters.expediente) { conditions.push('CA.CANUMEROEXPEDIENTE = :expediente'); binds.expediente = filters.expediente; }

    return this.oracle.executeQuery(
      `SELECT DISTINCT P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, C.CLNOMBRE, C.CLRUT,
              COUNT(CU.IDCUOTAS) AS CUOTAS_CONVENIO,
              SUM(CU.CUMONTO + CU.CUCARGOCONVENIO) AS MONTO_TOTAL
       FROM PRODUCTO P
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN CUOTA CU ON CU.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       WHERE ${conditions.join(' AND ')}
       GROUP BY P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, C.CLNOMBRE, C.CLRUT
       ORDER BY CA.CANUMEROEXPEDIENTE`,
      binds,
    );
  }
}
