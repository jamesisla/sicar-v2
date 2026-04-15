import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosRepository } from './contratos.repository';
import { AuditModule } from '../common/audit/audit.module';
import { Producto } from '../common/database/entities/producto.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';
import { Resolucion } from '../common/database/entities/resolucion.entity';
import { ProdResol } from '../common/database/entities/prod-resol.entity';
import { AdjuntoProducto } from '../common/database/entities/adjunto-producto.entity';
import { Fiscalizacion } from '../common/database/entities/fiscalizacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ContratoArriendo, Resolucion, ProdResol, AdjuntoProducto, Fiscalizacion]), AuditModule],
  controllers: [ContratosController],
  providers: [ContratosService, ContratosRepository],
  exports: [ContratosService],
})
export class ContratosModule {}
