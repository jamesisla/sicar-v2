import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../common/database/entities/region.entity';
import { Comuna } from '../common/database/entities/comuna.entity';
import { TipoProducto } from '../common/database/entities/tipo-producto.entity';
import { EstadoProducto } from '../common/database/entities/estado-producto.entity';
import { EstadoCuota } from '../common/database/entities/estado-cuota.entity';
import { TipoCobranza } from '../common/database/entities/tipo-cobranza.entity';
import { IndiceIpc } from '../common/database/entities/indice-ipc.entity';
import { ValorUf } from '../common/database/entities/valor-uf.entity';
import { InteresPenal } from '../common/database/entities/interes-penal.entity';

@Injectable()
export class ReferenciaService {
  constructor(
    @InjectRepository(Region) private regionRepo: Repository<Region>,
    @InjectRepository(Comuna) private comunaRepo: Repository<Comuna>,
    @InjectRepository(TipoProducto) private tipoProductoRepo: Repository<TipoProducto>,
    @InjectRepository(EstadoProducto) private estadoProductoRepo: Repository<EstadoProducto>,
    @InjectRepository(EstadoCuota) private estadoCuotaRepo: Repository<EstadoCuota>,
    @InjectRepository(TipoCobranza) private tipoCobranzaRepo: Repository<TipoCobranza>,
    @InjectRepository(IndiceIpc) private ipcRepo: Repository<IndiceIpc>,
    @InjectRepository(ValorUf) private ufRepo: Repository<ValorUf>,
    @InjectRepository(InteresPenal) private interesRepo: Repository<InteresPenal>,
  ) {}

  getRegiones() { return this.regionRepo.find({ order: { id: 'ASC' } }); }

  getComunas(regionId?: number) {
    return this.comunaRepo.find({
      where: regionId ? { regionId } : {},
      order: { nombre: 'ASC' },
    });
  }

  getTiposProducto() { return this.tipoProductoRepo.find(); }
  getEstadosProducto() { return this.estadoProductoRepo.find(); }
  getEstadosCuota() { return this.estadoCuotaRepo.find(); }
  getTiposCobranza() { return this.tipoCobranzaRepo.find(); }

  getIPC() { return this.ipcRepo.find({ order: { agno: 'DESC', mes: 'DESC' } }); }

  async upsertIPC(mes: number, agno: number, valor: number, variacion: number) {
    const existing = await this.ipcRepo.findOne({ where: { mes, agno } });
    if (existing) {
      await this.ipcRepo.update(existing.id, { valorIndice: valor, variacion });
    } else {
      await this.ipcRepo.save({ mes, agno, valorIndice: valor, variacion });
    }
    return { success: true };
  }

  getUF() { return this.ufRepo.find({ order: { fecha: 'DESC' }, take: 30 }); }

  async upsertUF(fecha: string, valor: number) {
    const fechaDate = new Date(fecha.split('/').reverse().join('-'));
    const existing = await this.ufRepo.findOne({ where: { fecha: fechaDate } });
    if (existing) {
      await this.ufRepo.update(existing.id, { valor });
    } else {
      await this.ufRepo.save({ fecha: fechaDate, valor });
    }
    return { success: true };
  }

  getInteresPenal() { return this.interesRepo.find({ order: { agno: 'DESC', mes: 'DESC' } }); }

  // Property 10: get index for specific date
  async getIndiceParaFecha(fecha: string, tipoBase: number): Promise<number> {
    if (tipoBase === 1) {
      const [, m, y] = fecha.split('/').map(Number);
      const row = await this.ipcRepo.findOne({ where: { mes: m, agno: y } });
      if (!row) throw new UnprocessableEntityException(`No existe IPC para ${m}/${y}`);
      return row.valorIndice;
    } else {
      const fechaDate = new Date(fecha.split('/').reverse().join('-'));
      const row = await this.ufRepo.findOne({ where: { fecha: fechaDate } });
      if (!row) throw new UnprocessableEntityException(`No existe UF para la fecha ${fecha}`);
      return row.valor;
    }
  }
}
