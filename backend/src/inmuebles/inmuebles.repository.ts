import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../common/database/entities/inmueble.entity';
import { CreateInmuebleDto } from './dto/inmueble.dto';

@Injectable()
export class InmueblesRepository {
  constructor(
    @InjectRepository(Inmueble) private repo: Repository<Inmueble>,
  ) {}

  findAll(filters: { region?: number; nombre?: string; rolSii?: string; page?: number; pageSize?: number }) {
    const { region, nombre, rolSii, page = 1, pageSize = 20 } = filters;
    const qb = this.repo.createQueryBuilder('i')
      .leftJoinAndSelect('i.region', 'r')
      .leftJoinAndSelect('i.comuna', 'c')
      .skip((page - 1) * pageSize).take(pageSize)
      .orderBy('i.nombreCalle', 'ASC');

    if (region) qb.andWhere('i.regionId = :region', { region });
    if (nombre) qb.andWhere('UPPER(i.nombreCalle) LIKE UPPER(:nombre)', { nombre: `%${nombre}%` });
    if (rolSii) qb.andWhere('i.rolSii = :rolSii', { rolSii });

    return qb.getManyAndCount();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['region', 'comuna'] });
  }

  create(dto: CreateInmuebleDto, userId: number) {
    return this.repo.save({
      regionId: dto.regionId, tipoUrbanoId: dto.tipoUrbanoId,
      tipoInmuebleId: dto.tipoInmuebleId, comunaId: dto.comunaId,
      rolSii: dto.rolSii, carpeta: dto.carpeta, porcion: dto.porcion,
      plano: dto.plano, superficieConstruida: dto.superficieConstruida,
      superficieTotal: dto.superficieTotal, avaluoFiscal: dto.avaluoFiscal,
      tasacionComercial: dto.tasacionComercial, nombreCalle: dto.nombreCalle,
      numeroCalle: dto.numeroCalle, block: dto.block, deptoOficina: dto.deptoOficina,
      villaLocalidad: dto.villaLocalidad, conservador: dto.conservador,
      fojas: dto.fojas, numeroInscripcion: dto.numeroInscripcion,
      agnoInscripcion: dto.agnoInscripcion, idCatastral: dto.idCatastral,
      usuarioActualiza: userId,
    });
  }
}
