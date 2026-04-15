import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/database/entities/producto.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';
import { CartaAviso } from '../common/database/entities/carta-aviso.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Cuota) private cuotaRepo: Repository<Cuota>,
    @InjectRepository(Cobranza) private cobranzaRepo: Repository<Cobranza>,
    @InjectRepository(CartaAviso) private cartaAvisoRepo: Repository<CartaAviso>,
    @InjectRepository(ContratoArriendo) private contratoRepo: Repository<ContratoArriendo>,
  ) {}

  async getDashboard(user: any) {
    const regionFilter = user.region !== 90;
    const region = user.region;

    const [sinAceptar, porTerminar, paraCDE, cuotasVencidas, avisosPendientes, enCDESinCerrar] =
      await Promise.all([
        // Contratos sin aceptar (en proceso, 15+ días)
        this.contratoRepo.createQueryBuilder('ca')
          .innerJoin('ca.producto', 'p')
          .where('p.estadoProductoId = 1')
          .andWhere('ca.aceptacionCliente IS NULL')
          .andWhere("ca.fchPrimeraCuota <= NOW() - INTERVAL '15 days'")
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),

        // Contratos por terminar (próximos 90 días)
        this.productoRepo.createQueryBuilder('p')
          .where('p.estadoProductoId IN (1, 5)')
          .andWhere('p.fchTermino BETWEEN NOW() AND NOW() + INTERVAL \'90 days\'')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),

        // Contratos con 3er aviso hace 7+ días
        this.cartaAvisoRepo.createQueryBuilder('av')
          .innerJoin(Cobranza, 'co', 'co.id = av.cobranzaId')
          .innerJoin('co.producto', 'p')
          .where('av.numeroAviso = 3')
          .andWhere("av.fchAviso <= NOW() - INTERVAL '7 days'")
          .andWhere('p.estadoProductoId = 5')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),

        // Cuotas vencidas sin aviso
        this.cuotaRepo.createQueryBuilder('cu')
          .innerJoin('cu.producto', 'p')
          .where('cu.estadoCuotaId = 3')
          .andWhere('cu.avisoCobranza IS NULL')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),

        // Avisos pendientes (plazo vencido para siguiente aviso)
        this.cartaAvisoRepo.createQueryBuilder('av')
          .innerJoin(Cobranza, 'co', 'co.id = av.cobranzaId')
          .innerJoin('co.producto', 'p')
          .where('av.numeroAviso < 3')
          .andWhere("av.fchAviso <= NOW() - INTERVAL '15 days'")
          .andWhere('p.estadoProductoId = 5')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),

        // Contratos en CDE sin cerrar
        this.productoRepo.createQueryBuilder('p')
          .where('p.estadoProductoId = 6')
          .andWhere(regionFilter ? 'p.regionId = :region' : '1=1', { region })
          .getCount(),
      ]);

    return { sinAceptar, porTerminar, paraCDE, cuotasVencidas, avisosPendientes, oficiosCDE: 0, enCDESinCerrar };
  }
}
