import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../common/database/entities/cliente.entity';
import { Persona } from '../common/database/entities/persona.entity';
import { Empresa } from '../common/database/entities/empresa.entity';
import { Domicilio } from '../common/database/entities/domicilio.entity';
import { Contacto } from '../common/database/entities/contacto.entity';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto } from './dto/cliente.dto';

@Injectable()
export class ClientesRepository {
  constructor(
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(Persona) private personaRepo: Repository<Persona>,
    @InjectRepository(Empresa) private empresaRepo: Repository<Empresa>,
    @InjectRepository(Domicilio) private domicilioRepo: Repository<Domicilio>,
    @InjectRepository(Contacto) private contactoRepo: Repository<Contacto>,
  ) {}

  findAll(filters: { rut?: number; nombre?: string; page?: number; pageSize?: number }) {
    const { rut, nombre, page = 1, pageSize = 20 } = filters;
    const qb = this.clienteRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.tipoCliente', 'tc')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('c.nombre', 'ASC');

    if (rut) qb.andWhere('c.rut = :rut', { rut });
    if (nombre) qb.andWhere('UPPER(c.nombre) LIKE UPPER(:nombre)', { nombre: `%${nombre}%` });

    return qb.getManyAndCount();
  }

  findById(id: number) {
    return this.clienteRepo.findOne({
      where: { id },
      relations: ['tipoCliente', 'comuna'],
    });
  }

  findByRut(rut: number) {
    return this.clienteRepo.findOne({ where: { rut } });
  }

  async createPersonaNatural(dto: CreatePersonaNaturalDto, userId: number) {
    const existing = await this.findByRut(dto.rut);
    if (existing) throw new ConflictException('El RUT ingresado ya está registrado');

    const cliente = this.clienteRepo.create({
      tipoClienteId: 1,
      nombre: `${dto.nombre} ${dto.apellidoPaterno} ${dto.apellidoMaterno || ''}`.trim(),
      rut: dto.rut, dv: dto.dv,
      fonoContacto: dto.telefono,
      mailContacto: dto.email,
      ingresoMes: dto.rentaMensual,
      usuarioActualiza: userId,
    });
    const saved = await this.clienteRepo.save(cliente);

    await this.personaRepo.save({
      clienteId: saved.id,
      rut: dto.rut, dv: dto.dv,
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      profesion: dto.profesion,
      email: dto.email,
      sexo: dto.sexo,
      nacionalidadId: dto.nacionalidad,
      estadoCivilId: dto.estadoCivil,
      usuarioActualiza: userId,
    });

    return { id: saved.id };
  }

  async createPersonaJuridica(dto: CreatePersonaJuridicaDto, userId: number) {
    const existing = await this.findByRut(dto.rut);
    if (existing) throw new ConflictException('El RUT ingresado ya está registrado');

    const cliente = this.clienteRepo.create({
      tipoClienteId: 2,
      nombre: dto.razonSocial,
      rut: dto.rut, dv: dto.dv,
      usuarioActualiza: userId,
    });
    const saved = await this.clienteRepo.save(cliente);

    await this.empresaRepo.save({
      clienteId: saved.id,
      razonSocial: dto.razonSocial,
      giro: dto.giro,
      rutRepLegal: dto.repLegalRut,
      dvRepLegal: dto.repLegalDv,
      nombreRepLegal: dto.repLegalNombre,
      apellidoPaternoRep: dto.repLegalApellidoPaterno,
      apellidoMaternoRep: dto.repLegalApellidoMaterno,
    });

    return { id: saved.id };
  }

  addDomicilio(clienteId: number, dto: AddDomicilioDto) {
    return this.domicilioRepo.save({
      clienteId, comunaId: dto.comunaId, calle: dto.calle,
      block: dto.block, deptoOficina: dto.deptoOficina, villaLocalidad: dto.villaLocalidad,
    });
  }

  addContacto(clienteId: number, dto: AddContactoDto) {
    return this.contactoRepo.save({
      clienteId, nombre: dto.nombre, cargoRelacion: dto.cargoRelacion,
      email: dto.email, numeroFijo: dto.numeroFijo, numeroMovil: dto.numeroMovil,
    });
  }
}
