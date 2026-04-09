import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ClientesRepository } from './clientes.repository';
import { AuditService } from '../common/audit/audit.service';
import { validarRut } from '../common/validators/rut.validator';
import { CreatePersonaNaturalDto, CreatePersonaJuridicaDto, AddDomicilioDto, AddContactoDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    private repo: ClientesRepository,
    private audit: AuditService,
  ) {}

  findAll(filters: any) {
    return this.repo.findAll(filters);
  }

  async findById(id: number) {
    const cliente = await this.repo.findById(id);
    if (!cliente) throw new NotFoundException('El recurso solicitado no existe');
    return cliente;
  }

  async createPersonaNatural(dto: CreatePersonaNaturalDto, userId: number, ip: string) {
    if (!validarRut(dto.rut, dto.dv)) {
      throw new UnprocessableEntityException('El dígito verificador del RUT es incorrecto');
    }
    const result = await this.repo.createPersonaNatural(dto, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(result.idCliente),
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
      idUsuario: userId, entidad: 'CLIENTE', idRegistro: String(result.idCliente),
      operacion: 'INSERT', valorNuevo: dto, ipCliente: ip, endpoint: '/api/v1/clientes',
    });
    return result;
  }

  addDomicilio(clienteId: number, dto: AddDomicilioDto) {
    return this.repo.addDomicilio(clienteId, dto);
  }

  addContacto(clienteId: number, dto: AddContactoDto) {
    return this.repo.addContacto(clienteId, dto);
  }
}
