import { Module } from '@nestjs/common';
import { InmueblesController } from './inmuebles.controller';
import { InmueblesService } from './inmuebles.service';
import { InmueblesRepository } from './inmuebles.repository';
import { AuditModule } from '../common/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [InmueblesController],
  providers: [InmueblesService, InmueblesRepository],
  exports: [InmueblesService],
})
export class InmueblesModule {}
