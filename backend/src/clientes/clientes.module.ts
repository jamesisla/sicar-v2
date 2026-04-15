import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClientesRepository } from './clientes.repository';
import { AuditModule } from '../common/audit/audit.module';
import { Cliente } from '../common/database/entities/cliente.entity';
import { Persona } from '../common/database/entities/persona.entity';
import { Empresa } from '../common/database/entities/empresa.entity';
import { Domicilio } from '../common/database/entities/domicilio.entity';
import { Contacto } from '../common/database/entities/contacto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Persona, Empresa, Domicilio, Contacto]), AuditModule],
  controllers: [ClientesController],
  providers: [ClientesService, ClientesRepository],
  exports: [ClientesService],
})
export class ClientesModule {}
