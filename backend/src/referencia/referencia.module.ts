import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenciaController } from './referencia.controller';
import { ReferenciaService } from './referencia.service';
import { Region } from '../common/database/entities/region.entity';
import { Comuna } from '../common/database/entities/comuna.entity';
import { TipoProducto } from '../common/database/entities/tipo-producto.entity';
import { EstadoProducto } from '../common/database/entities/estado-producto.entity';
import { EstadoCuota } from '../common/database/entities/estado-cuota.entity';
import { TipoCobranza } from '../common/database/entities/tipo-cobranza.entity';
import { IndiceIpc } from '../common/database/entities/indice-ipc.entity';
import { ValorUf } from '../common/database/entities/valor-uf.entity';
import { InteresPenal } from '../common/database/entities/interes-penal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region, Comuna, TipoProducto, EstadoProducto, EstadoCuota, TipoCobranza, IndiceIpc, ValorUf, InteresPenal])],
  controllers: [ReferenciaController],
  providers: [ReferenciaService],
  exports: [ReferenciaService],
})
export class ReferenciaModule {}
