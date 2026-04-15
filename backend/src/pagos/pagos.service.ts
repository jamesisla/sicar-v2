import { Injectable, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { validarRut } from '../common/validators/rut.validator';
import { CuponPago } from '../common/database/entities/cupon-pago.entity';
import { CuotaCuponPago } from '../common/database/entities/cuota-cupon-pago.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { PagoTgr } from '../common/database/entities/pago-tgr.entity';
import { CargaBanco } from '../common/database/entities/carga-banco.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';
import { RegistrarAbonoDto, GenerarCuponDto, NotificacionTgrDto, CargaBancoDto } from './dto/pagos.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(CuponPago) private cuponRepo: Repository<CuponPago>,
    @InjectRepository(CuotaCuponPago) private cuotaCuponRepo: Repository<CuotaCuponPago>,
    @InjectRepository(Cuota) private cuotaRepo: Repository<Cuota>,
    @InjectRepository(PagoTgr) private pagoTgrRepo: Repository<PagoTgr>,
    @InjectRepository(CargaBanco) private cargaBancoRepo: Repository<CargaBanco>,
    @InjectRepository(CuentaCorriente) private ccRepo: Repository<CuentaCorriente>,
    private config: ConfigService,
  ) {}

  async registrarAbono(dto: RegistrarAbonoDto) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dto.fechaContable)) {
      throw new UnprocessableEntityException('La fecha contable debe tener formato DD/MM/YYYY');
    }
    if (!validarRut(dto.rutUsuario, dto.dvUsuario)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT del usuario es incorrecto');
    }

    // Register movement in cuenta_corriente
    const [d, m, y] = dto.fechaContable.split('/').map(Number);
    await this.ccRepo.save({
      productoId: dto.productoId,
      tipoMovimientoId: dto.tipoMovimiento,
      cargoAbono: 2, // abono
      fchMovimiento: new Date(y, m - 1, d),
      fchContable: new Date(y, m - 1, d),
      montoMov: 0,
      idCliente: dto.rutUsuario,
      anioAsiento: dto.ejercicio,
    });

    return {
      success: true,
      sigfeConfig: {
        codigoInstitucion: this.config.get('SIGFE_CODIGO_INSTITUCION'),
        unidad: dto.unidadSigfe,
        ejercicio: dto.ejercicio,
        region: dto.codigoRegion,
      },
    };
  }

  async generarCupon(dto: GenerarCuponDto, userId: number) {
    // Property 8: validate cuotas belong to same product
    const cuotas = await this.cuotaRepo.createQueryBuilder('cu')
      .where('cu.productoId = :productoId', { productoId: dto.productoId })
      .andWhere('cu.id IN (:...ids)', { ids: dto.cuotaIds })
      .getMany();

    if (cuotas.length !== dto.cuotaIds.length) {
      throw new UnprocessableEntityException('Todas las cuotas deben pertenecer al mismo contrato');
    }

    // Check no active cupon
    for (const cuotaId of dto.cuotaIds) {
      const existing = await this.cuotaCuponRepo.findOne({
        where: { productoId: dto.productoId, cuotaId },
      });
      if (existing) throw new ConflictException(`La cuota ${cuotaId} ya tiene un cupón emitido`);
    }

    const montoArriendo = cuotas.reduce((s, c) => s + Number(c.monto), 0);
    const montoReajuste = cuotas.reduce((s, c) => s + Number(c.montoReavaluo) + Number(c.cargoReavaluo), 0);
    const montoInteres = cuotas.reduce((s, c) => s + Number(c.cargoInteres), 0);
    const montoConvenio = cuotas.reduce((s, c) => s + Number(c.cargoConvenio), 0);
    const montoTotal = montoArriendo + montoReajuste + montoInteres + montoConvenio;

    const cupon = await this.cuponRepo.save({
      productoId: dto.productoId,
      folio: `CP${Date.now()}`,
      origenCarga: dto.origenCarga === 'operador' ? 1 : dto.origenCarga === 'portal' ? 2 : 3,
      usuarioCreacion: userId,
      montoReajuste, montoInteres, montoConvenio, montoTotal, montoArriendo,
    });

    for (const cuota of cuotas) {
      await this.cuotaCuponRepo.save({
        cuponPagoId: cupon.id, productoId: dto.productoId,
        cuotaId: cuota.id, tipoMovId: 1, monto: cuota.monto,
      });
    }

    return { id: cupon.id, folio: cupon.folio, montoTotal };
  }

  async procesarNotificacionTgr(dto: NotificacionTgrDto) {
    // Property 6: idempotencia
    const existing = await this.pagoTgrRepo.findOne({ where: { idOperacion: dto.idOperacion } });
    if (existing) return { success: true, idempotent: true };

    await this.pagoTgrRepo.save({
      cuponId: dto.cuponId,
      idOperacion: dto.idOperacion,
      idTransaccion: dto.idTransaccion,
      status: dto.estado,
      totalPago: dto.monto,
      resultado: dto.estado,
      tipoPago: 'TGR',
    });

    if (dto.estado === 'exitoso') {
      const cuotaIds = await this.cuotaCuponRepo.find({ where: { cuponPagoId: dto.cuponId } });
      for (const cc of cuotaIds) {
        await this.cuotaRepo.update(cc.cuotaId, { estadoCuotaId: 2, fchPago: new Date() });
      }
    }

    return { success: true, idempotent: false };
  }

  async cargarBanco(dto: CargaBancoDto) {
    let procesados = 0, errores = 0;
    for (const reg of dto.registros) {
      try {
        const existing = await this.cargaBancoRepo.findOne({ where: { folio: reg.folio } });
        if (!existing) {
          await this.cargaBancoRepo.save({
            folio: reg.folio,
            fecha: new Date(reg.fecha.split('/').reverse().join('-')),
            monto: reg.monto,
            oficina: reg.oficina,
            fchContable: reg.fechaContable ? new Date(reg.fechaContable.split('/').reverse().join('-')) : null,
            exito: true,
            tipoCartera: dto.tipo,
            fchActualiza: new Date(),
          });
        }
        procesados++;
      } catch { errores++; }
    }
    return { total: dto.registros.length, procesados, errores };
  }
}
