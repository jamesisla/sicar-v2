import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';

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
  constructor(
    @InjectRepository(CuentaCorriente) private ccRepo: Repository<CuentaCorriente>,
    private config: ConfigService,
  ) {}

  async buscarDevengos(filters: any) {
    const qb = this.ccRepo.createQueryBuilder('cc')
      .where('cc.centralizadoSigfe = 0')
      .orderBy('cc.fchMovimiento', 'DESC')
      .take(100);

    if (filters.fechaDesde) {
      const [d, m, y] = filters.fechaDesde.split('/').map(Number);
      qb.andWhere('cc.fchMovimiento >= :desde', { desde: new Date(y, m - 1, d) });
    }
    if (filters.fechaHasta) {
      const [d, m, y] = filters.fechaHasta.split('/').map(Number);
      qb.andWhere('cc.fchMovimiento <= :hasta', { hasta: new Date(y, m - 1, d) });
    }

    return qb.getMany();
  }

  async getDevengo(id: number) {
    return this.ccRepo.findOne({ where: { id }, relations: ['tipoMovimiento'] });
  }

  async registrarDevengo(tipo: 'creacion' | 'ajuste', params: any) {
    return {
      tipo,
      params: {
        partida: this.config.get('SIGFE_PARTIDA'),
        capitulo: this.config.get('SIGFE_CAPITULO'),
        areaTransaccional: this.config.get('SIGFE_AREA_TRANSACCIONAL'),
        ...params,
      },
    };
  }

  async registrarContabilizacion(dto: RegistrarContabilizacionDto) {
    // Property 4: debe = haber
    if (Math.abs(Number(dto.montoDebe) - Number(dto.montoHaber)) > 0.001) {
      throw new UnprocessableEntityException('Los montos de debe y haber no coinciden');
    }
    if (Number(dto.montoDebe) <= 0) {
      throw new UnprocessableEntityException('Los montos deben ser valores numéricos positivos');
    }
    return { success: true, cuentaDebe: dto.cuentaDebe, cuentaHaber: dto.cuentaHaber, monto: dto.montoDebe };
  }

  async listarContabilizaciones(filters: any) {
    return this.ccRepo.createQueryBuilder('cc')
      .leftJoinAndSelect('cc.tipoMovimiento', 'tm')
      .orderBy('cc.fchMovimiento', 'DESC')
      .take(100)
      .getMany();
  }
}
