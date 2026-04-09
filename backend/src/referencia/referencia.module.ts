import { Module } from '@nestjs/common';
import { ReferenciaController } from './referencia.controller';
import { ReferenciaService } from './referencia.service';

@Module({
  controllers: [ReferenciaController],
  providers: [ReferenciaService],
  exports: [ReferenciaService],
})
export class ReferenciaModule {}
