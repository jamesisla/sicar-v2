import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../common/database/entities/cliente.entity';
import { Persona } from '../common/database/entities/persona.entity';
import { Empresa } from '../common/database/entities/empresa.entity';
import { Domicilio } from '../common/database/entities/domicilio.entity';
import { Contacto } from '../common/database/entities/contacto.entity';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto, UpdateClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesRepository {
  constructor(
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(Persona) private personaRepo: Repository<Persona>,
    @InjectRepository(Empresa) private empresaRepo: Repository<Empresa>,
    @InjectRepository(Domicilio) private domicilioRepo: Repository<Domicilio>,
    @InjectRepository(Contacto) private contactoRepo: Repository<Contacto>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
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

  async findByIdDetalle(id: number) {
    const [cliente, persona, empresa, domicilios, contactos, contratos] = await Promise.all([
      this.clienteRepo.findOne({ where: { id }, relations: ['tipoCliente', 'comuna'] }),
      this.personaRepo.findOne({ where: { clienteId: id } }),
      this.empresaRepo.findOne({ where: { clienteId: id } }),
      this.domicilioRepo.find({ where: { clienteId: id }, relations: ['comuna'] }),
      this.contactoRepo.find({ where: { clienteId: id } }),
      this.productoRepo.createQueryBuilder('p')
        .innerJoinAndSelect('p.estadoProducto', 'ep')
        .innerJoinAndSelect('p.tipoProducto', 'tp')
        .innerJoinAndSelect('p.inmueble', 'i')
        .leftJoinAndMapOne('p.contrato', ContratoArriendo, 'ca', 'ca.productoId = p.id')
        .where('p.clienteId = :id', { id })
        .orderBy('p.id', 'DESC')
        .getMany(),
    ]);
    return { cliente, persona, empresa, domicilios, contactos, contratos };
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

  async update(id: number, dto: UpdateClienteDto, userId: number) {
    // Update cliente base
    const clienteUpdate: any = { usuarioActualiza: userId };
    if (dto.fonoContacto !== undefined) clienteUpdate.fonoContacto = dto.fonoContacto;
    if (dto.mailContacto !== undefined) clienteUpdate.mailContacto = dto.mailContacto;
    if (dto.ingresoMes   !== undefined) clienteUpdate.ingresoMes   = dto.ingresoMes;
    if (dto.nombre       !== undefined) clienteUpdate.nombre       = dto.nombre;
    if (Object.keys(clienteUpdate).length > 1) {
      await this.clienteRepo.update(id, clienteUpdate);
    }
    // Update persona
    if (dto.profesion !== undefined || dto.sexo !== undefined) {
      const personaUpdate: any = {};
      if (dto.profesion !== undefined) personaUpdate.profesion = dto.profesion;
      if (dto.sexo      !== undefined) personaUpdate.sexo      = dto.sexo;
      await this.personaRepo.update({ clienteId: id }, personaUpdate);
    }
    // Update empresa
    if (dto.giro !== undefined || dto.repLegalNombre !== undefined || dto.repLegalApellidoPaterno !== undefined || dto.repLegalRut !== undefined) {
      const empresaUpdate: any = {};
      if (dto.giro                    !== undefined) empresaUpdate.giro                    = dto.giro;
      if (dto.repLegalNombre          !== undefined) empresaUpdate.nombreRepLegal           = dto.repLegalNombre;
      if (dto.repLegalApellidoPaterno !== undefined) empresaUpdate.apellidoPaternoRep       = dto.repLegalApellidoPaterno;
      if (dto.repLegalRut             !== undefined) empresaUpdate.rutRepLegal              = dto.repLegalRut;
      if (dto.repLegalDv              !== undefined) empresaUpdate.dvRepLegal               = dto.repLegalDv;
      await this.empresaRepo.update({ clienteId: id }, empresaUpdate);
    }
    return { success: true };
  }

  async desactivar(id: number, userId: number) {
    await this.clienteRepo.update(id, { usuarioActualiza: userId });
    return { success: true };
  }

  async deleteDomicilio(clienteId: number, domicilioId: number) {
    await this.domicilioRepo.delete({ id: domicilioId, clienteId });
  }

  async deleteContacto(clienteId: number, contactoId: number) {
    await this.contactoRepo.delete({ id: contactoId, clienteId });
  }
}
