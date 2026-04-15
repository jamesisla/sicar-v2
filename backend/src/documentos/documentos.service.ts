import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(ContratoArriendo) private contratoRepo: Repository<ContratoArriendo>,
    @InjectRepository(Cuota) private cuotaRepo: Repository<Cuota>,
    @InjectRepository(Cobranza) private cobranzaRepo: Repository<Cobranza>,
  ) {}

  async generarCartaMorosa(productoId: number, userId: number): Promise<string> {
    const producto = await this.productoRepo.findOne({
      where: { id: productoId },
      relations: ['cliente', 'inmueble', 'inmueble.region'],
    });
    if (!producto) throw new UnprocessableEntityException('El producto no existe');
    if (!producto.cliente?.nombre) throw new UnprocessableEntityException('Dato faltante: nombre del cliente');

    const contrato = await this.contratoRepo.findOne({ where: { productoId } });
    if (!contrato?.numeroExpediente) throw new UnprocessableEntityException('Dato faltante: número de expediente');

    const cuotasVencidas = await this.cuotaRepo.find({ where: { productoId, estadoCuotaId: 3 } });
    const totalDeuda = cuotasVencidas.reduce((s, c) => s + Number(c.monto), 0);

    // Register aviso date
    await this.cobranzaRepo.update({ productoId }, { usuarioActualiza: userId });

    const fecha = new Date().toLocaleDateString('es-CL');
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Carta Morosa — ${contrato.numeroExpediente}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  .header { text-align: center; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .label { font-weight: bold; width: 200px; }
  .total { font-size: 1.2em; font-weight: bold; color: #c00; }
</style>
</head>
<body>
  <div class="header">
    <h2>MINISTERIO DE BIENES NACIONALES</h2>
    <h3>AVISO DE MOROSIDAD</h3>
    <p>Fecha: ${fecha}</p>
  </div>
  <div>
    <h4>Datos del Contrato</h4>
    <table>
      <tr><td class="label">N° Expediente:</td><td>${contrato.numeroExpediente}</td></tr>
      <tr><td class="label">Cliente:</td><td>${producto.cliente.nombre} (RUT: ${producto.cliente.rut}-${producto.cliente.dv})</td></tr>
      <tr><td class="label">Inmueble:</td><td>${producto.inmueble?.nombreCalle || ''} ${producto.inmueble?.numeroCalle || ''}</td></tr>
      <tr><td class="label">Región:</td><td>${producto.inmueble?.region?.nombre || ''}</td></tr>
      <tr><td class="label">Teléfono:</td><td>${producto.cliente.fonoContacto || 'No registrado'}</td></tr>
    </table>
  </div>
  <div>
    <h4>Deuda Actual</h4>
    <table>
      <tr><td class="label">Cuotas vencidas:</td><td>${cuotasVencidas.length}</td></tr>
      <tr><td class="label">Total adeudado:</td><td class="total">$${totalDeuda.toLocaleString('es-CL')}</td></tr>
    </table>
  </div>
  <p>Se le notifica que debe regularizar su situación de pago a la brevedad.</p>
</body>
</html>`;
  }
}
