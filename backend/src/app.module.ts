import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { ContratosModule } from './contratos/contratos.module';
import { CobranzaModule } from './cobranza/cobranza.module';
import { PagosModule } from './pagos/pagos.module';
import { ContabilidadModule } from './contabilidad/contabilidad.module';
import { ReportesModule } from './reportes/reportes.module';
import { AlertasModule } from './alertas/alertas.module';
import { AdminModule } from './admin/admin.module';
import { ReferenciaModule } from './referencia/referencia.module';
import { DocumentosModule } from './documentos/documentos.module';
import { CodigosBarraModule } from './codigos-barra/codigos-barra.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    ClientesModule,
    InmueblesModule,
    ContratosModule,
    CobranzaModule,
    PagosModule,
    ContabilidadModule,
    ReportesModule,
    AlertasModule,
    AdminModule,
    ReferenciaModule,
    DocumentosModule,
    CodigosBarraModule,
  ],
})
export class AppModule {}
