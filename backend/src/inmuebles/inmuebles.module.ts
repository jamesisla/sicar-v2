import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InmueblesController } from './inmuebles.controller';
import { InmueblesService } from './inmuebles.service';
import { InmueblesRepository } from './inmuebles.repository';
import { AuditModule } from '../common/audit/audit.module';
import { Inmueble } from '../common/database/entities/inmueble.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inmueble]), AuditModule],
  controllers: [InmueblesController],
  providers: [InmueblesService, InmueblesRepository],
  exports: [InmueblesService],
})
export class InmueblesModule {}
