import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ContratosRepository } from './contratos.repository';
import { AuditService } from '../common/audit/audit.service';
import { CreateContratoDto, AddResolucionDto, AddAdjuntoDto, AddFiscalizacionDto, CambiarEstadoDto } from './dto/contrato.dto';

function parseDate(str: string): Date {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

@Injectable()
export class ContratosService {
  constructor(private repo: ContratosRepository, private audit: AuditService) {}

  async findAll(filters: any) {
    const [rows, total] = await this.repo.findAll(filters);
    return { rows, total };
  }

  async findById(id: number) {
    const detalle = await this.repo.findById(id);
    if (!detalle.producto) throw new NotFoundException('El recurso solicitado no existe');
    return detalle;
  }

  async create(dto: CreateContratoDto, userId: number, ip: string) {
    // Property 12: fechaPrimeraCuota > fechaFirma
    const fechaCuota = parseDate(dto.fechaPrimeraCuota);
    const fechaFirma = parseDate(dto.fechaFirma);
    if (fechaCuota <= fechaFirma) {
      throw new UnprocessableEntityException(
        'La fecha de primera cuota debe ser posterior a la fecha de firma del contrato',
      );
    }
    const result = await this.repo.create(dto, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'PRODUCTO', idRegistro: String(result.id),
      operacion: 'INSERT', valorNuevo: dto, ipCliente: ip,
    });
    return result;
  }

  async cambiarEstado(id: number, dto: CambiarEstadoDto, userId: number, ip: string) {
    const { producto } = await this.findById(id);
    await this.repo.cambiarEstado(id, dto.estadoProductoId, userId);
    await this.audit.log({
      idUsuario: userId, entidad: 'PRODUCTO', idRegistro: String(id),
      operacion: 'UPDATE', valorAnterior: { estado: producto?.estadoProductoId },
      valorNuevo: { estado: dto.estadoProductoId }, ipCliente: ip,
    });
  }

  addResolucion(productoId: number, dto: AddResolucionDto) {
    return this.repo.addResolucion(productoId, dto);
  }

  addAdjunto(productoId: number, dto: AddAdjuntoDto, userId: number) {
    return this.repo.addAdjunto(productoId, dto, userId);
  }

  addFiscalizacion(productoId: number, dto: AddFiscalizacionDto, userId: number) {
    return this.repo.addFiscalizacion(productoId, dto, userId);
  }
}
