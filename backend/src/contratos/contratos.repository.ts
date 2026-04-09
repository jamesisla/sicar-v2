import { Injectable, ConflictException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { CreateContratoDto, AddResolucionDto, AddAdjuntoDto, AddFiscalizacionDto } from './dto/contrato.dto';

@Injectable()
export class ContratosRepository {
  constructor(private oracle: OracleService) {}

  async findAll(filters: { region?: number; estado?: number; tipo?: number; page?: number; pageSize?: number }) {
    const { region, estado, tipo, page = 1, pageSize = 20 } = filters;
    const conditions: string[] = [];
    const binds: any = {};

    if (region) { conditions.push('P.PRREGION = :region'); binds.region = region; }
    if (estado) { conditions.push('P.ESTADOPRODUCTO_IDESTADOP = :estado'); binds.estado = estado; }
    if (tipo) { conditions.push('P.TIPOPRODUCTO_IDTIPOPRODUCTO = :tipo'); binds.tipo = tipo; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    binds.offset = (page - 1) * pageSize;
    binds.pageSize = pageSize;

    return this.oracle.executeQuery(
      `SELECT P.IDPRODUCTO, CA.CANUMEROEXPEDIENTE, P.PRFCHINICIO, P.PRFCHTERMINO,
              P.PRMONTOTOTAL, P.PRREGION, EP.EPNOMBRE AS ESTADO,
              C.CLNOMBRE AS CLIENTE, C.CLRUT, C.CLDV,
              I.INNOMBRECALLE, I.INNUMEROCALLE
       FROM PRODUCTO P
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN ESTADOPRODUCTO EP ON EP.IDESTADOPRODUCTO = P.ESTADOPRODUCTO_IDESTADOP
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN INMUEBLE I ON I.IDINMUEBLE = P.INMUEBLE_IDINMUEBLE
       ${where}
       ORDER BY CA.CANUMEROEXPEDIENTE
       OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
      binds,
    );
  }

  async findById(id: number) {
    const result = await this.oracle.executeQuery(
      `SELECT P.*, CA.*, EP.EPNOMBRE AS ESTADO_NOMBRE,
              TP.TPNOMBRE AS TIPO_PRODUCTO, TU.TUNOMBRE AS TIPO_USO,
              C.CLNOMBRE AS CLIENTE_NOMBRE, C.CLRUT, C.CLDV,
              I.INNOMBRECALLE, I.INNUMEROCALLE, R.RENOMBRE AS REGION_NOMBRE
       FROM PRODUCTO P
       JOIN CONTRATOARRIENDO CA ON CA.PRODUCTO_IDPRODUCTO = P.IDPRODUCTO
       JOIN ESTADOPRODUCTO EP ON EP.IDESTADOPRODUCTO = P.ESTADOPRODUCTO_IDESTADOP
       JOIN TIPOPRODUCTO TP ON TP.IDTIPOPRODUCTO = P.TIPOPRODUCTO_IDTIPOPRODUCTO
       JOIN TIPOUSO TU ON TU.IDTIPOUSO = CA.TIPOUSO_IDTIPOUSO
       JOIN CLIENTE C ON C.IDCLIENTE = P.CLIENTE_IDCLIENTE
       JOIN INMUEBLE I ON I.IDINMUEBLE = P.INMUEBLE_IDINMUEBLE
       JOIN REGION R ON R.IDREGION = P.PRREGION
       WHERE P.IDPRODUCTO = :id`,
      { id },
    );
    return result.rows[0];
  }

  async findByExpediente(expediente: string) {
    const result = await this.oracle.executeQuery(
      'SELECT PRODUCTO_IDPRODUCTO FROM CONTRATOARRIENDO WHERE CANUMEROEXPEDIENTE = :expediente',
      { expediente },
    );
    return result.rows[0];
  }

  async create(dto: CreateContratoDto, userId: number) {
    const existing = await this.findByExpediente(dto.expediente);
    if (existing) throw new ConflictException('El número de expediente ya está registrado');

    // Insert PRODUCTO
    const prodResult = await this.oracle.executeQuery(
      `INSERT INTO PRODUCTO (ESTADOPRODUCTO_IDESTADOP, CLIENTE_IDCLIENTE, INMUEBLE_IDINMUEBLE,
        TIPOPRODUCTO_IDTIPOPRODUCTO, PRFCHINICIO, PRFCHTERMINO, PRNUMEROCUOTAS,
        PRREGION, PRMONTOTOTAL, PRTMC, PRFCHACTUALIZA, PFUSUARIOACTUALIZA)
       VALUES (1, :clienteId, :inmuebleId, :tipoProductoId,
               TO_DATE(:fechaInicio, 'DD/MM/YYYY'), NULL, :numeroCuotas,
               :region, :montoTotal, 0, SYSDATE, :userId)
       RETURNING IDPRODUCTO INTO :id`,
      {
        clienteId: dto.clienteId, inmuebleId: dto.inmuebleId,
        tipoProductoId: dto.tipoProductoId,
        fechaInicio: dto.fechaPrimeraCuota,
        numeroCuotas: dto.numeroCuotas, region: dto.region,
        montoTotal: dto.montoTotal, userId,
        id: { dir: 3003, type: 2010 },
      },
    );

    const idProducto = (prodResult.rows[0] as any)?.ID;

    // Insert CONTRATOARRIENDO
    await this.oracle.executeQuery(
      `INSERT INTO CONTRATOARRIENDO (PRODUCTO_IDPRODUCTO, PERIODOCUOTA_IDPERIODOCUOTA,
        TIPOUSO_IDTIPOUSO, CAFCHPRIMERACUOTA, CAFECHAFIRMA, CAINTERESPENAL,
        TIPOBASECALCULO_IDBASE, CACANONARRIENDO, CAINTERES, CANUMEROEXPEDIENTE,
        CAFCHACTUALIZA, CAUSUARIOACTUALIZA)
       VALUES (:idProducto, :periodoCuotaId, :tipoUsoId,
               TO_DATE(:fechaPrimeraCuota, 'DD/MM/YYYY'),
               TO_DATE(:fechaFirma, 'DD/MM/YYYY'),
               :interesPerial, :tipoBaseCalculo, :canonArriendo, :interes,
               :expediente, SYSDATE, :userId)`,
      {
        idProducto, periodoCuotaId: dto.periodoCuotaId, tipoUsoId: dto.tipoUsoId,
        fechaPrimeraCuota: dto.fechaPrimeraCuota, fechaFirma: dto.fechaFirma,
        interesPerial: dto.interesPerial || 0, tipoBaseCalculo: dto.tipoBaseCalculo || 1,
        canonArriendo: dto.canonArriendo || dto.montoTotal, interes: dto.interes || 0,
        expediente: dto.expediente, userId,
      },
    );

    return { idProducto };
  }

  async cambiarEstado(id: number, estadoId: number, monto: number, userId: number) {
    await this.oracle.executeQuery(
      `UPDATE PRODUCTO SET ESTADOPRODUCTO_IDESTADOP = :estadoId,
        PRFCHACTUALIZA = SYSDATE, PFUSUARIOACTUALIZA = :userId
       WHERE IDPRODUCTO = :id`,
      { estadoId, userId, id },
    );
    if (monto !== undefined) {
      await this.oracle.executeQuery(
        `INSERT INTO SUBESTADOPRODUCTO (IDPRODUCTO, IDESTADOCONTRATO, MONTO)
         VALUES (:id, :estadoId, :monto)`,
        { id, estadoId, monto },
      );
    }
  }

  async addResolucion(productoId: number, dto: AddResolucionDto) {
    const resResult = await this.oracle.executeQuery(
      `INSERT INTO RESOLUCION (TIPORESOLUCION_IDTIPORES, REANIORESOLUCION,
        RENUMERORESOLUCION, REFCHRESOLUCION, REFCHACTUALIZA)
       VALUES (:tipoResolucionId, :anioResolucion, :numeroResolucion,
               TO_DATE(:fechaResolucion, 'DD/MM/YYYY'), SYSDATE)
       RETURNING IDRESOLUCION INTO :id`,
      {
        tipoResolucionId: dto.tipoResolucionId, anioResolucion: dto.anioResolucion,
        numeroResolucion: dto.numeroResolucion,
        fechaResolucion: dto.fechaResolucion || null,
        id: { dir: 3003, type: 2010 },
      },
    );
    const idResolucion = (resResult.rows[0] as any)?.ID;
    await this.oracle.executeQuery(
      `INSERT INTO PRODRESOL (RESOLUCION_IDRESOLUCION, PRODUCTO_IDPRODUCTO,
        PRTIPOACCION, PRCAUSALTERMINO)
       VALUES (:idResolucion, :productoId, :tipoAccion, :causaTermino)`,
      {
        idResolucion, productoId,
        tipoAccion: dto.tipoAccion || null, causaTermino: dto.causaTermino || null,
      },
    );
    return { idResolucion };
  }

  async addAdjunto(productoId: number, dto: AddAdjuntoDto, userId: number) {
    return this.oracle.executeQuery(
      `INSERT INTO ADJUNTOPRODUCTO (IDPRODUCTO, IDTIPOADJUNTO, APNOMBRE, APRUTA,
        APESTADO, APFCHSUBIDA, APUSUARIO)
       VALUES (:productoId, :tipoAdjuntoId, :nombre, :ruta, 1, SYSDATE, :userId)`,
      { productoId, tipoAdjuntoId: dto.tipoAdjuntoId, nombre: dto.nombre, ruta: dto.ruta, userId },
    );
  }

  async addFiscalizacion(productoId: number, dto: AddFiscalizacionDto, userId: number) {
    return this.oracle.executeQuery(
      `INSERT INTO FISCALIZACION (PRODUCTO_IDPRODUCTO, TIPOFISCALIZACION_IDTIPOFIS,
        FIFCHFISCALIZACION, FINOMBREFISCALIZADOR, FIAPELLIDOPATERNOFISC,
        FIOBSERVACION, FIFCHACTUALIZA, FIUSUARIOACTUALIZA)
       VALUES (:productoId, :tipoFiscalizacionId,
               TO_DATE(:fechaFiscalizacion, 'DD/MM/YYYY'),
               :nombreFiscalizador, :apellidoPaterno, :observacion, SYSDATE, :userId)`,
      {
        productoId, tipoFiscalizacionId: dto.tipoFiscalizacionId,
        fechaFiscalizacion: dto.fechaFiscalizacion,
        nombreFiscalizador: dto.nombreFiscalizador,
        apellidoPaterno: dto.apellidoPaterno || null,
        observacion: dto.observacion || null, userId,
      },
    );
  }
}
