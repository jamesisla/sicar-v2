import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';
import { CartaAviso } from '../common/database/entities/carta-aviso.entity';

@Injectable()
export class CobranzaRepository {
  constructor(
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(ContratoArriendo) private contratoRepo: Repository<ContratoArriendo>,
    @InjectRepository(Cuota) private cuotaRepo: Repository<Cuota>,
    @InjectRepository(CuentaCorriente) private ccRepo: Repository<CuentaCorriente>,
    @InjectRepository(Cobranza) private cobranzaRepo: Repository<Cobranza>,
    @InjectRepository(CartaAviso) private cartaAvisoRepo: Repository<CartaAviso>,
  ) {}

  async buscarDeuda(filters: any, userRegion: number) {
    const qb = this.productoRepo.createQueryBuilder('p')
      .innerJoinAndMapOne('p.contrato', ContratoArriendo, 'ca', 'ca.productoId = p.id')
      .innerJoinAndSelect('p.cliente', 'c')
      .innerJoinAndSelect('p.inmueble', 'i')
      .innerJoinAndSelect('p.estadoProducto', 'ep')
      .where('p.estadoProductoId = 5')
      .andWhere('p.tipoProductoId = :tipo', { tipo: filters.tipoProducto });

    // Property 2: filtrado regional automático
    if (userRegion !== 90) qb.andWhere('p.regionId = :region', { region: userRegion });
    else if (filters.region) qb.andWhere('p.regionId = :region', { region: filters.region });

    // Property 3: AND de todos los criterios
    if (filters.rut) qb.andWhere('c.rut = :rut', { rut: filters.rut });
    if (filters.nombre) qb.andWhere('UPPER(c.nombre) LIKE UPPER(:nombre)', { nombre: `%${filters.nombre}%` });
    if (filters.expediente) qb.andWhere('ca.numeroExpediente = :exp', { exp: filters.expediente });
    if (filters.carpeta) qb.andWhere('i.carpeta = :carpeta', { carpeta: filters.carpeta });
    if (filters.porcion) qb.andWhere('i.porcion = :porcion', { porcion: filters.porcion });

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    qb.skip((page - 1) * pageSize).take(pageSize).orderBy('p.id', 'DESC');

    return qb.getManyAndCount();
  }

  getCuentaCorriente(productoId: number) {
    return this.ccRepo.createQueryBuilder('cc')
      .leftJoinAndSelect('cc.tipoMovimiento', 'tm')
      .where('cc.productoId = :productoId', { productoId })
      .orderBy('cc.fchMovimiento', 'ASC')
      .getMany();
  }

  getCuotas(productoId: number) {
    return this.cuotaRepo.createQueryBuilder('cu')
      .leftJoinAndSelect('cu.estadoCuota', 'ec')
      .where('cu.productoId = :productoId', { productoId })
      .orderBy('cu.fchVencimiento', 'ASC')
      .getMany();
  }

  async getCarteras(tipo: string, userRegion: number) {
    const tipoMap: any = {
      castigada: { estado: 3, tipoCobranza: 4, estadoProd: 6, tipoProducto: 1 },
      financiera: { estado: 1, tipoCobranza: 2, estadoProd: 5, tipoProducto: 1 },
      venta: { estado: 1, tipoCobranza: 2, estadoProd: 5, tipoProducto: 2 },
      concesion: { estado: 1, tipoCobranza: 2, estadoProd: 5, tipoProducto: 3 },
    };
    const cfg = tipoMap[tipo] || tipoMap.castigada;

    const qb = this.cobranzaRepo.createQueryBuilder('co')
      .innerJoinAndSelect('co.producto', 'p')
      .innerJoinAndSelect('p.cliente', 'c')
      .innerJoinAndSelect('co.tipoCobranza', 'tc')
      .leftJoin(ContratoArriendo, 'ca', 'ca.productoId = p.id')
      .where('co.estado = :estado', { estado: cfg.estado })
      .andWhere('co.tipoCobranzaId = :tipoCobranza', { tipoCobranza: cfg.tipoCobranza })
      .andWhere('p.estadoProductoId = :estadoProd', { estadoProd: cfg.estadoProd })
      .andWhere('p.tipoProductoId = :tipoProducto', { tipoProducto: cfg.tipoProducto });

    if (userRegion !== 90) qb.andWhere('p.regionId = :region', { region: userRegion });

    return qb.getMany();
  }

  async registrarPagoCartera(cobranzaId: number, monto: number, nroDoc: number) {
    await this.cobranzaRepo.update(cobranzaId, { montoCobrado: monto, estado: 2 });
    return { success: true };
  }

  async getUltimoAviso(productoId: number) {
    return this.cartaAvisoRepo.createQueryBuilder('av')
      .innerJoin(Cobranza, 'co', 'co.id = av.cobranzaId')
      .where('co.productoId = :productoId', { productoId })
      .orderBy('av.fchAviso', 'DESC')
      .getOne();
  }

  async getOrCreateCobranza(productoId: number) {
    let cobranza = await this.cobranzaRepo.findOne({ where: { productoId, estado: 1 } });
    if (!cobranza) {
      cobranza = await this.cobranzaRepo.save({ productoId, tipoCobranzaId: 1, estado: 1, montoCobrado: 0 });
    }
    return cobranza;
  }

  async registrarAviso(productoId: number, numeroAviso: number, userId: number) {
    const cobranza = await this.getOrCreateCobranza(productoId);
    return this.cartaAvisoRepo.save({
      cobranzaId: cobranza.id,
      numeroAviso,
      fchAviso: new Date(),
      usuarioAviso: userId,
    });
  }

  async enviarCDE(productoId: number, userId: number) {
    await this.productoRepo.update(productoId, { estadoProductoId: 6, usuarioActualiza: userId });
  }

  async buscarConvenios(filters: any, userRegion: number) {
    const qb = this.cuotaRepo.createQueryBuilder('cu')
      .innerJoinAndSelect('cu.producto', 'p')
      .innerJoin(ContratoArriendo, 'ca', 'ca.productoId = p.id')
      .innerJoinAndSelect('p.cliente', 'c')
      .where('cu.estadoCuotaId = 4');

    if (userRegion !== 90) qb.andWhere('p.regionId = :region', { region: userRegion });
    if (filters.rut) qb.andWhere('c.rut = :rut', { rut: filters.rut });
    if (filters.expediente) qb.andWhere('ca.numeroExpediente = :exp', { exp: filters.expediente });

    return qb.getMany();
  }
}
