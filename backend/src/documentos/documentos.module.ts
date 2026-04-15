import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { Cobranza } from '../common/database/entities/cobranza.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ContratoArriendo, Cuota, Cobranza])],
  controllers: [DocumentosController],
  providers: [DocumentosService],
})
export class DocumentosModule {}
