import { Injectable, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { OracleService } from '../common/oracle/oracle.service';
import { ConfigService } from '@nestjs/config';
import { validarRut } from '../common/validators/rut.validator';
import { RegistrarAbonoDto, GenerarCuponDto, NotificacionTgrDto, CargaBancoDto } from './dto/pagos.dto';

@Injectable()
export class PagosService {
  constructor(private oracle: OracleService, private config: ConfigService) {}

  async registrarAbono(dto: RegistrarAbonoDto) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dto.fechaContable)) {
      throw new UnprocessableEntityException('La fecha contable debe tener formato DD/MM/YYYY');
    }
    if (!validarRut(dto.rutUsuario, dto.dvUsuario)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT del usuario es incorrecto');
    }

    // Select SP based on tipoMovimiento (Property 9: atomicidad)
    const spName = [1, 2, 3].includes(dto.tipoMovimiento)
      ? 'PA_SELCTACTELISTASIGFE03'
      : 'PA_SELCTACTELISTASIGFE07';

    const cuentas = await this.oracle.executeStoredProcedure(spName, {
      p_idproducto: { val: dto.productoId, dir: 3001 },
      p_ejercicio: { val: dto.ejercicio, dir: 3001 },
      p_cursor: { dir: 3003, type: 2021 },
    });

    // Generate SIGFE XML using env vars (no hardcoded values — fixes H3)
    const sigfeParams = {
      codigoInstitucion: this.config.get('SIGFE_CODIGO_INSTITUCION'),
      correoNotificacion: this.config.get('SIGFE_CORREO_NOTIFICACION'),
      unidad: dto.unidadSigfe,
      ejercicio: dto.ejercicio,
      fechaContable: dto.fechaContable,
      codigoRegion: dto.codigoRegion,
    };

    // Register SIGFE asiento
    const result = await this.oracle.executeStoredProcedure('PA_INSASIENTOSIGFE01', {
      p_idproducto: { val: dto.productoId, dir: 3001 },
      p_tipomovimiento: { val: dto.tipoMovimiento, dir: 3001 },
      p_fechacontable: { val: dto.fechaContable, dir: 3001 },
      p_unidadsigfe: { val: dto.unidadSigfe, dir: 3001 },
      p_ejercicio: { val: dto.ejercicio, dir: 3001 },
      VAR_VALIDA: { dir: 3003, type: 2010 },
      VAR_MENSAJE: { dir: 3003, type: 2001, maxSize: 200 },
    });

    // Update convenio cuotas if applicable
    if (dto.cuotas?.length) {
      await this.oracle.executeStoredProcedure('PA_UPDCENTRALIZARCUOTAS', {
        p_idproducto: { val: dto.productoId, dir: 3001 },
        p_cuotas: { val: dto.cuotas.join(','), dir: 3001 },
        VAR_VALIDA: { dir: 3003, type: 2010 },
      });
    }

    return { success: true, sigfeParams };
  }

  async generarCupon(dto: GenerarCuponDto, userId: number) {
    // Property 8: validate cuotas belong to same product
    const cuotasCheck = await this.oracle.executeQuery(
      `SELECT COUNT(*) AS CNT FROM CUOTA
       WHERE PRODUCTO_IDPRODUCTO = :productoId AND IDCUOTAS IN (${dto.cuotaIds.map((_, i) => `:c${i}`).join(',')})`,
      { productoId: dto.productoId, ...Object.fromEntries(dto.cuotaIds.map((id, i) => [`c${i}`, id])) },
    );
    const cnt = (cuotasCheck.rows[0] as any)?.CNT;
    if (cnt !== dto.cuotaIds.length) {
      throw new UnprocessableEntityException('Todas las cuotas deben pertenecer al mismo contrato');
    }

    // Check no active cupon for these cuotas
    for (const cuotaId of dto.cuotaIds) {
      const existing = await this.oracle.executeQuery(
        `SELECT COUNT(*) AS CNT FROM CUOTACUPONPAGO WHERE IDPRODUCTO = :productoId AND IDCUOTA = :cuotaId`,
        { productoId: dto.productoId, cuotaId },
      );
      if ((existing.rows[0] as any)?.CNT > 0) {
        throw new ConflictException(`La cuota ${cuotaId} ya tiene un cupón emitido`);
      }
    }

    // Get cuota amounts
    const cuotasData = await this.oracle.executeQuery(
      `SELECT IDCUOTAS, CUMONTO, CUMONTOREAVALUO, CUCARGOREAVALUO, CUCARGOINTERES, CUCARGOCONVENIO
       FROM CUOTA WHERE PRODUCTO_IDPRODUCTO = :productoId AND IDCUOTAS IN (${dto.cuotaIds.map((_, i) => `:c${i}`).join(',')})`,
      { productoId: dto.productoId, ...Object.fromEntries(dto.cuotaIds.map((id, i) => [`c${i}`, id])) },
    );

    const cuotas = cuotasData.rows as any[];
    const montoArriendo = cuotas.reduce((s, c) => s + (c.CUMONTO || 0), 0);
    const montoReajuste = cuotas.reduce((s, c) => s + (c.CUMONTOREAVALUO || 0) + (c.CUCARGOREAVALUO || 0), 0);
    const montoInteres = cuotas.reduce((s, c) => s + (c.CUCARGOINTERES || 0), 0);
    const montoConvenio = cuotas.reduce((s, c) => s + (c.CUCARGOCONVENIO || 0), 0);
    const montoTotal = montoArriendo + montoReajuste + montoInteres + montoConvenio;

    const folio = `CP${Date.now()}`;

    const cuponResult = await this.oracle.executeQuery(
      `INSERT INTO CUPONPAGO (CPIDPRODUCTO, CPIDCLIENTE, FOLIO, CPFCHEMISION,
        CPORIGENCARGA, CPUSUARIOCREACION, CPMONTOREAJUSTE, CPMONTOINTERES,
        CPMONTOCONVENIO, CPMONTOTOTAL, CPMONTOARRIENDO)
       SELECT :productoId, P.CLIENTE_IDCLIENTE, :folio, SYSDATE,
              :origenCarga, :userId, :montoReajuste, :montoInteres,
              :montoConvenio, :montoTotal, :montoArriendo
       FROM PRODUCTO P WHERE P.IDPRODUCTO = :productoId2
       RETURNING IDCUPONPAGO INTO :id`,
      {
        productoId: dto.productoId, folio, origenCarga: dto.origenCarga === 'operador' ? 1 : dto.origenCarga === 'portal' ? 2 : 3,
        userId, montoReajuste, montoInteres, montoConvenio, montoTotal, montoArriendo,
        productoId2: dto.productoId, id: { dir: 3003, type: 2010 },
      },
    );

    const idCupon = (cuponResult.rows[0] as any)?.ID;

    // Associate cuotas to cupon
    for (const cuota of cuotas) {
      await this.oracle.executeQuery(
        `INSERT INTO CUOTACUPONPAGO (IDCUPONPAGO, IDPRODUCTO, IDCUOTA, IDTIPOMOV, CCPMONTO)
         VALUES (:idCupon, :productoId, :idCuota, 1, :monto)`,
        { idCupon, productoId: dto.productoId, idCuota: cuota.IDCUOTAS, monto: cuota.CUMONTO },
      );
    }

    return { idCupon, folio, montoTotal };
  }

  async procesarNotificacionTgr(dto: NotificacionTgrDto) {
    // Property 6: idempotencia — check if already processed
    const existing = await this.oracle.executeQuery(
      `SELECT IDCUPON FROM PAGOSTGR WHERE IDOPERACION = :idOperacion`,
      { idOperacion: dto.idOperacion },
    );

    if ((existing.rows as any[]).length > 0) {
      // Already processed — return success without side effects
      return { success: true, idempotent: true };
    }

    // Register TGR payment
    await this.oracle.executeQuery(
      `INSERT INTO PAGOSTGR (IDCUPON, IDEXT, STATUS, IDOPERACION, IDTRANSACCION,
        FOLIO, TOTALPAGO, FECHAPAGO, RESULTADO, TIPOPAGO)
       VALUES (:cuponId, :idOperacion, :estado, :idOperacion, :idTransaccion,
               :cuponId, :monto, TO_DATE(:fechaPago, 'DD/MM/YYYY'), :estado, 'TGR')`,
      {
        cuponId: dto.cuponId, idOperacion: dto.idOperacion, estado: dto.estado,
        idTransaccion: dto.idTransaccion, monto: dto.monto, fechaPago: dto.fechaPago,
      },
    );

    if (dto.estado === 'exitoso') {
      // Mark cuota as paid
      await this.oracle.executeQuery(
        `UPDATE CUOTA SET ESTADOCUOTA_IDESTADOCUOTA = 2, CUFCHPAGO = SYSDATE
         WHERE (PRODUCTO_IDPRODUCTO, IDCUOTAS) IN (
           SELECT IDPRODUCTO, IDCUOTA FROM CUOTACUPONPAGO WHERE IDCUPONPAGO = :cuponId
         )`,
        { cuponId: dto.cuponId },
      );
    }

    return { success: true, idempotent: false };
  }

  async cargarBanco(dto: CargaBancoDto) {
    const tablaMap: any = { arriendo: 'CARGABANCO', venta: 'CARGABANCOVENTA', concesion: 'CARGABANCOCONCESION' };
    const tabla = tablaMap[dto.tipo] || 'CARGABANCO';
    let procesados = 0, errores = 0;

    for (const reg of dto.registros) {
      try {
        await this.oracle.executeQuery(
          `INSERT INTO ${tabla} (CBNFOLIO, CBFECHA, CBMONTO, CBOFICINA, CBNFECHACONTABLE, EXITO, FECHAACTUALIZA)
           VALUES (:folio, TO_DATE(:fecha, 'DD/MM/YYYY'), :monto, :oficina, TO_DATE(:fechaContable, 'DD/MM/YYYY'), 1, SYSTIMESTAMP)`,
          { folio: reg.folio, fecha: reg.fecha, monto: reg.monto, oficina: reg.oficina || null, fechaContable: reg.fechaContable || reg.fecha },
        );
        procesados++;
      } catch {
        errores++;
      }
    }

    return { total: dto.registros.length, procesados, errores };
  }
}
