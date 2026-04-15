import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Producto } from '../common/database/entities/producto.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';
import { ContratoArriendo } from '../common/database/entities/contrato-arriendo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Cuota, CuentaCorriente, ContratoArriendo])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
