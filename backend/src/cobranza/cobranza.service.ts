import { Injectable, NotFoundException, UnprocessableEntityException, ForbiddenException } from '@nestjs/common';
import { CobranzaRepository } from './cobranza.repository';

const DIAS_MIN_ENTRE_AVISOS = 15;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class CobranzaService {
  constructor(private repo: CobranzaRepository) {}

  async buscarDeuda(filters: any, user: any) {
    if (user.region !== 90 && filters.region && Number(filters.region) !== user.region) {
      throw new ForbiddenException('No tiene permisos para acceder a datos de esta región');
    }
    const [rows, total] = await this.repo.buscarDeuda(filters, user.region);
    return { rows, total };
  }

  async getSituacionDeuda(productoId: number) {
    const [cuentaCorriente, cuotas] = await Promise.all([
      this.repo.getCuentaCorriente(productoId),
      this.repo.getCuotas(productoId),
    ]);
    // Property 5: suma de cuotas = total deuda
    const totalDeuda = cuotas
      .filter(c => c.estadoCuotaId === 3)
      .reduce((sum, c) => sum + Number(c.monto) + Number(c.montoReavaluo) + Number(c.cargoConvenio), 0);

    return { cuentaCorriente, cuotas, totalDeuda };
  }

  async getCarteras(tipo: string, user: any) {
    return this.repo.getCarteras(tipo, user.region);
  }

  async registrarPagoCartera(cobranzaId: number, fechaDoc: string, monto: number, nroDoc: number) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaDoc)) {
      throw new UnprocessableEntityException('La fecha debe tener formato DD/MM/YYYY');
    }
    if (monto < 0 || nroDoc < 0) {
      throw new UnprocessableEntityException('El monto y número de documento deben ser valores positivos');
    }
    return this.repo.registrarPagoCartera(cobranzaId, monto, nroDoc);
  }

  async generarAviso(productoId: number, userId: number) {
    const ultimoAviso = await this.repo.getUltimoAviso(productoId);
    const hoy = new Date();

    if (ultimoAviso) {
      const diasTranscurridos = daysBetween(new Date(ultimoAviso.fchAviso), hoy);
      if (diasTranscurridos < DIAS_MIN_ENTRE_AVISOS) {
        const fechaMinima = new Date(ultimoAviso.fchAviso);
        fechaMinima.setDate(fechaMinima.getDate() + DIAS_MIN_ENTRE_AVISOS);
        throw new UnprocessableEntityException(
          `No han transcurrido los días mínimos. Fecha mínima: ${fechaMinima.toLocaleDateString('es-CL')}`,
        );
      }
      if (ultimoAviso.numeroAviso >= 3) {
        throw new UnprocessableEntityException('Ya se emitió el tercer aviso. Proceda con el envío al CDE.');
      }
      await this.repo.registrarAviso(productoId, ultimoAviso.numeroAviso + 1, userId);
      return { numeroAviso: ultimoAviso.numeroAviso + 1, habilitaCDE: ultimoAviso.numeroAviso + 1 === 3 };
    }

    await this.repo.registrarAviso(productoId, 1, userId);
    return { numeroAviso: 1, habilitaCDE: false };
  }

  async enviarCDE(productoId: number, userId: number) {
    const ultimoAviso = await this.repo.getUltimoAviso(productoId);
    if (!ultimoAviso || ultimoAviso.numeroAviso < 3) {
      throw new UnprocessableEntityException('Se requiere el tercer aviso emitido para enviar al CDE');
    }
    return this.repo.enviarCDE(productoId, userId);
  }

  async buscarConvenios(filters: any, user: any) {
    return this.repo.buscarConvenios(filters, user.region);
  }
}
