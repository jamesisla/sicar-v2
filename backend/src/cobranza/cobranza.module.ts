import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CobranzaController } from './cobranza.controller';
import { CobranzaService } from './cobranza.service';
import { CobranzaRepository } from './cobranza.repository';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';
import { CartaAviso } from '../common/database/entities/carta-aviso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ContratoArriendo, Cuota, CuentaCorriente, Cobranza, CartaAviso])],
  controllers: [CobranzaController],
  providers: [CobranzaService, CobranzaRepository],
  exports: [CobranzaService],
})
export class CobranzaModule {}
