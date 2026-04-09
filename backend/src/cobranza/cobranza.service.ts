import { Injectable, NotFoundException, UnprocessableEntityException, ForbiddenException } from '@nestjs/common';
import { CobranzaRepository } from './cobranza.repository';
import { ConfigService } from '@nestjs/config';

// Property 7: días mínimos entre avisos (configurable)
const DIAS_MIN_ENTRE_AVISOS = 15;

function parseDateDDMMYYYY(str: string): Date {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class CobranzaService {
  constructor(private repo: CobranzaRepository, private config: ConfigService) {}

  async buscarDeuda(filters: any, user: any) {
    // Property 2: filtrado regional
    if (user.region !== 90 && filters.region && filters.region !== user.region) {
      throw new ForbiddenException('No tiene permisos para acceder a datos de esta región');
    }
    return this.repo.buscarDeuda(filters, user.region);
  }

  async getSituacionDeuda(productoId: number) {
    const [cuentaCorriente, cuotas] = await Promise.all([
      this.repo.getCuentaCorriente(productoId),
      this.repo.getCuotas(productoId),
    ]);

    // Property 5: suma de cuotas = total deuda
    const cuotasRows = cuotas.rows as any[];
    const totalDeuda = cuotasRows
      .filter(c => c.ESTADOCUOTA_IDESTADOCUOTA === 3) // vencidas
      .reduce((sum, c) => sum + (c.CUMONTO || 0) + (c.CUMONTOREAVALUO || 0) + (c.CUCARGOCONVENIO || 0), 0);

    return { cuentaCorriente: cuentaCorriente.rows, cuotas: cuotasRows, totalDeuda };
  }

  getCarteras(tipo: string, user: any) {
    return this.repo.getCarteras(tipo, user.region);
  }

  async registrarPagoCartera(cobranzaId: number, fechaDoc: string, monto: number, nroDoc: number) {
    // Validate date format
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaDoc)) {
      throw new UnprocessableEntityException('La fecha debe tener formato DD/MM/YYYY');
    }
    if (monto < 0 || nroDoc < 0) {
      throw new UnprocessableEntityException('El monto y número de documento deben ser valores positivos');
    }
    return this.repo.registrarPagoCartera(cobranzaId, fechaDoc, monto, nroDoc);
  }

  async generarAviso(productoId: number, userId: number) {
    const ultimoAviso = await this.repo.getUltimoAviso(productoId);
    const hoy = new Date();

    // Property 7: secuencia obligatoria de avisos
    if (ultimoAviso) {
      const diasTranscurridos = daysBetween(new Date(ultimoAviso.CAFCH_AVISO), hoy);
      const numeroAviso = ultimoAviso.NUMERO_AVISO;

      if (diasTranscurridos < DIAS_MIN_ENTRE_AVISOS) {
        const fechaMinima = new Date(ultimoAviso.CAFCH_AVISO);
        fechaMinima.setDate(fechaMinima.getDate() + DIAS_MIN_ENTRE_AVISOS);
        throw new UnprocessableEntityException(
          `No han transcurrido los días mínimos entre avisos. Fecha mínima habilitada: ${fechaMinima.toLocaleDateString('es-CL')}`,
        );
      }

      if (numeroAviso >= 3) {
        throw new UnprocessableEntityException('Ya se emitió el tercer aviso. Proceda con el envío al CDE.');
      }

      await this.repo.registrarAviso(productoId, ultimoAviso.IDCOBRANZA, numeroAviso + 1, userId);
      return { numeroAviso: numeroAviso + 1, habilitaCDE: numeroAviso + 1 === 3 };
    }

    // Primer aviso — crear registro de cobranza
    await this.repo.registrarAviso(productoId, 0, 1, userId);
    return { numeroAviso: 1, habilitaCDE: false };
  }

  async enviarCDE(productoId: number, userId: number) {
    const ultimoAviso = await this.repo.getUltimoAviso(productoId);
    if (!ultimoAviso || ultimoAviso.NUMERO_AVISO < 3) {
      throw new UnprocessableEntityException('Se requiere el tercer aviso emitido para enviar al CDE');
    }
    return this.repo.enviarCDE(productoId, userId);
  }

  buscarConvenios(filters: any, user: any) {
    return this.repo.buscarConvenios(filters, user.region);
  }
}
