import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { CuponPago } from '../common/database/entities/cupon-pago.entity';
import { CuotaCuponPago } from '../common/database/entities/cuota-cupon-pago.entity';
import { Cuota } from '../common/database/entities/cuota.entity';
import { PagoTgr } from '../common/database/entities/pago-tgr.entity';
import { CargaBanco } from '../common/database/entities/carga-banco.entity';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuponPago, CuotaCuponPago, Cuota, PagoTgr, CargaBanco, CuentaCorriente])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
