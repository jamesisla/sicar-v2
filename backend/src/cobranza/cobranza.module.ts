import { Module } from '@nestjs/common';
import { CobranzaController } from './cobranza.controller';
import { CobranzaService } from './cobranza.service';
import { CobranzaRepository } from './cobranza.repository';

@Module({
  controllers: [CobranzaController],
  providers: [CobranzaService, CobranzaRepository],
  exports: [CobranzaService],
})
export class CobranzaModule {}
