import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ClientesRepository } from './clientes.repository';
import { AuditService } from '../common/audit/audit.service';
import { validarRut } from '../common/validators/rut.validator';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto, UpdateClienteDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    private repo: ClientesRepository,
    private audit: AuditService,
  ) {}

  async findAll(filters: any) {
    const [rows, total] = await this.repo.findAll(filters);
    return { rows, total };
  }

  async findById(id: number) {
    const detalle = await this.repo.findByIdDetalle(id);
    if (!detalle.cliente) throw new NotFoundException('El recurso solicitado no existe');
    return detalle;
  }

  async createPersonaNatural(dto: CreatePersonaNaturalDto, userId: number, ip: string) {
    if (!validarRut(dto.rut, dto.dv)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT es incorrecto');
    }
    const result = await this.repo.createPersonaNatural(dto, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(result.id),
      operacion: 'INSERT', valorNuevo: dto, ipCliente: ip, endpoint: '/api/v1/clientes',
    });
    return result;
  }

  async createPersonaJuridica(dto: CreatePersonaJuridicaDto, userId: number, ip: string) {
    if (!validarRut(dto.rut, dto.dv)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT es incorrecto');
    }
    if (!validarRut(dto.repLegalRut, dto.repLegalDv)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT del representante legal es incorrecto');
    }
    const result = await this.repo.createPersonaJuridica(dto, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(result.id),
      operacion: 'INSERT', valorNuevo: dto, ipCliente: ip, endpoint: '/api/v1/clientes',
    });
    return result;
  }

  async update(id: number, dto: UpdateClienteDto, userId: number, ip: string) {
    const detalle = await this.repo.findByIdDetalle(id);
    if (!detalle.cliente) throw new NotFoundException('El recurso solicitado no existe');
    const result = await this.repo.update(id, dto, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(id),
      operacion: 'UPDATE', valorAnterior: detalle.cliente, valorNuevo: dto, ipCliente: ip, endpoint: `/api/v1/clientes/${id}`,
    });
    return result;
  }

  async desactivar(id: number, userId: number, ip: string) {
    const detalle = await this.repo.findByIdDetalle(id);
    if (!detalle.cliente) throw new NotFoundException('El recurso solicitado no existe');
    await this.repo.desactivar(id, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(id),
      operacion: 'UPDATE', valorAnterior: { estado: 1 }, valorNuevo: { estado: 0 }, ipCliente: ip,
    });
    return { success: true };
  }

  addDomicilio(clienteId: number, dto: AddDomicilioDto) {
    return this.repo.addDomicilio(clienteId, dto);
  }

  async deleteDomicilio(clienteId: number, domicilioId: number) {
    await this.repo.deleteDomicilio(clienteId, domicilioId);
    return { success: true };
  }

  addContacto(clienteId: number, dto: AddContactoDto) {
    return this.repo.addContacto(clienteId, dto);
  }

  async deleteContacto(clienteId: number, contactoId: number) {
    await this.repo.deleteContacto(clienteId, contactoId);
    return { success: true };
  }
}
