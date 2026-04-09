import { Module } from '@nestjs/common';
import { CodigosBarraController } from './codigos-barra.controller';
import { CodigosBarraService } from './codigos-barra.service';

@Module({
  controllers: [CodigosBarraController],
  providers: [CodigosBarraService],
  exports: [CodigosBarraService],
})
export class CodigosBarraModule {}
