import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContabilidadController } from './contabilidad.controller';
import { ContabilidadService } from './contabilidad.service';
import { CuentaCorriente } from '../common/database/entities/cuenta-corriente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaCorriente])],
  controllers: [ContabilidadController],
  providers: [ContabilidadService],
  exports: [ContabilidadService],
})
export class ContabilidadModule {}
