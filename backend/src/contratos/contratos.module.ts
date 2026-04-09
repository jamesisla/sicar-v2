import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosRepository } from './contratos.repository';
import { AuditModule } from '../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ContratosController],
  providers: [ContratosService, ContratosRepository],
  exports: [ContratosService],
})
export class ContratosModule {}
