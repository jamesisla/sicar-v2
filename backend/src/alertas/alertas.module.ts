import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { Producto } from '../common/database/entities/producto.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';
import { CartaAviso } from '../common/database/entities/carta-aviso.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Cuota, Cobranza, CartaAviso, ContratoArriendo])],
  controllers: [AlertasController],
  providers: [AlertasService],
})
export class AlertasModule {}
