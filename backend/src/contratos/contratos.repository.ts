import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Resolucion } from '../common/database/entities/resolucion.entity';
import { ProdResol } from '../common/database/entities/prod-resol.entity';
import { AdjuntoProducto } from '../common/database/entities/adjunto-producto.entity';
import { Fiscalizacion } from '../common/database/entities/fiscalizacion.entity';
import { CreateContratoDto, AddResolucionDto, AddAdjuntoDto, AddFiscalizacionDto } from './dto/contrato.dto';

@Injectable()
export class ContratosRepository {
  constructor(
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(ContratoArriendo) private contratoRepo: Repository<ContratoArriendo>,
    @InjectRepository(Resolucion) private resolucionRepo: Repository<Resolucion>,
    @InjectRepository(ProdResol) private prodResolRepo: Repository<ProdResol>,
    @InjectRepository(AdjuntoProducto) private adjuntoRepo: Repository<AdjuntoProducto>,
    @InjectRepository(Fiscalizacion) private fiscalizacionRepo: Repository<Fiscalizacion>,
  ) {}

  findAll(filters: { region?: number; estado?: number; tipo?: number; page?: number; pageSize?: number }) {
    const { region, estado, tipo, page = 1, pageSize = 20 } = filters;
    const qb = this.productoRepo.createQueryBuilder('p')
      .innerJoinAndSelect('p.estadoProducto', 'ep')
      .innerJoinAndSelect('p.tipoProducto', 'tp')
      .innerJoinAndSelect('p.cliente', 'c')
      .innerJoinAndSelect('p.inmueble', 'i')
      .leftJoinAndMapOne('p.contrato', ContratoArriendo, 'ca', 'ca.productoId = p.id')
      .skip((page - 1) * pageSize).take(pageSize)
      .orderBy('p.id', 'DESC');

    if (region) qb.andWhere('p.regionId = :region', { region });
    if (estado) qb.andWhere('p.estadoProductoId = :estado', { estado });
    if (tipo) qb.andWhere('p.tipoProductoId = :tipo', { tipo });

    return qb.getManyAndCount();
  }

  findById(id: number) {
    return this.productoRepo.findOne({
      where: { id },
      relations: ['estadoProducto', 'tipoProducto', 'cliente', 'inmueble', 'inmueble.region'],
    });
  }

  async findByExpediente(expediente: string) {
    return this.contratoRepo.findOne({ where: { numeroExpediente: expediente } });
  }

  async create(dto: CreateContratoDto, userId: number) {
    const existing = await this.findByExpediente(dto.expediente);
    if (existing) throw new ConflictException('El número de expediente ya está registrado');

    const producto = await this.productoRepo.save({
      estadoProductoId: 1,
      clienteId: dto.clienteId,
      inmuebleId: dto.inmuebleId,
      tipoProductoId: dto.tipoProductoId,
      fchInicio: new Date(dto.fechaPrimeraCuota.split('/').reverse().join('-')),
      numeroCuotas: dto.numeroCuotas,
      regionId: dto.region,
      montoTotal: dto.montoTotal,
      usuarioActualiza: userId,
    });

    await this.contratoRepo.save({
      productoId: producto.id,
      periodoCuotaId: dto.periodoCuotaId,
      tipoUsoId: dto.tipoUsoId,
      fchPrimeraCuota: new Date(dto.fechaPrimeraCuota.split('/').reverse().join('-')),
      fchFirma: new Date(dto.fechaFirma.split('/').reverse().join('-')),
      interesPerial: dto.interesPerial || 0,
      tipoBaseCalculoId: dto.tipoBaseCalculo || 1,
      canonArriendo: dto.canonArriendo || dto.montoTotal,
      interes: dto.interes || 0,
      numeroExpediente: dto.expediente,
      usuarioActualiza: userId,
    });

    return { id: producto.id };
  }

  async cambiarEstado(id: number, estadoId: number, userId: number) {
    await this.productoRepo.update(id, { estadoProductoId: estadoId, usuarioActualiza: userId });
  }

  async addResolucion(productoId: number, dto: AddResolucionDto) {
    const resolucion = await this.resolucionRepo.save({
      tipoResolucionId: dto.tipoResolucionId,
      anioResolucion: dto.anioResolucion,
      numeroResolucion: dto.numeroResolucion,
      fchResolucion: dto.fechaResolucion ? new Date(dto.fechaResolucion.split('/').reverse().join('-')) : null,
    });
    await this.prodResolRepo.save({
      resolucionId: resolucion.id, productoId,
      tipoAccion: dto.tipoAccion, causaTermino: dto.causaTermino,
    });
    return { id: resolucion.id };
  }

  addAdjunto(productoId: number, dto: AddAdjuntoDto, userId: number) {
    return this.adjuntoRepo.save({
      productoId, tipoAdjuntoId: dto.tipoAdjuntoId,
      nombre: dto.nombre, ruta: dto.ruta, estado: 1, usuario: userId,
    });
  }

  addFiscalizacion(productoId: number, dto: AddFiscalizacionDto, userId: number) {
    return this.fiscalizacionRepo.save({
      productoId, tipoFiscalizacionId: dto.tipoFiscalizacionId,
      fchFiscalizacion: new Date(dto.fechaFiscalizacion.split('/').reverse().join('-')),
      nombreFiscalizador: dto.nombreFiscalizador,
      apellidoPaterno: dto.apellidoPaterno,
      observacion: dto.observacion,
      usuarioActualiza: userId,
    });
  }
}
