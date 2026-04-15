import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/database/entities/producto.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Cuota) private cuotaRepo: Repository<Cuota>,
    @InjectRepository(CuentaCorriente) private ccRepo: Repository<CuentaCorriente>,
    @InjectRepository(ContratoArriendo) private contratoRepo: Repository<ContratoArriendo>,
  ) {}

  async getReporte(tipo: string, filters: any, user: any) {
    const regionFilter = user.region !== 90;
    const region = user.region;

    switch (tipo) {
      case 'cartera-morosa':
        return this.productoRepo.createQueryBuilder('p')
          .innerJoin(ContratoArriendo, 'ca', 'ca.productoId = p.id')
          .innerJoinAndSelect('p.cliente', 'c')
          .innerJoinAndSelect('p.estadoProducto', 'ep')
          .where('p.estadoProductoId = 5')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .orderBy('p.montoTotal', 'DESC')
          .getMany();

      case 'convenios':
        return this.cuotaRepo.createQueryBuilder('cu')
          .innerJoinAndSelect('cu.producto', 'p')
          .innerJoinAndSelect('p.cliente', 'c')
          .where('cu.estadoCuotaId = 4')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getMany();

      case 'abonos':
        const qb = this.ccRepo.createQueryBuilder('cc')
          .innerJoin('cc.producto', 'p')
          .leftJoinAndSelect('cc.tipoMovimiento', 'tm')
          .where('cc.cargoAbono = 2')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .orderBy('cc.fchMovimiento', 'DESC')
          .take(500);
        if (filters.fechaDesde) {
          const [d, m, y] = filters.fechaDesde.split('/').map(Number);
          qb.andWhere('cc.fchMovimiento >= :desde', { desde: new Date(y, m - 1, d) });
        }
        return qb.getMany();

      default:
        return [];
    }
  }
}
