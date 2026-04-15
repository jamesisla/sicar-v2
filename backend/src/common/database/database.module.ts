import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// All entities
import { Region } from './entities/region.entity';
import { Provincia } from './entities/provincia.entity';
import { Comuna } from './entities/comuna.entity';
import { TipoCliente } from './entities/tipo-cliente.entity';
import { Cliente } from './entities/cliente.entity';
import { Persona } from './entities/persona.entity';
import { Empresa } from './entities/empresa.entity';
import { Domicilio } from './entities/domicilio.entity';
import { Contacto } from './entities/contacto.entity';
import { Inmueble } from './entities/inmueble.entity';
import { EstadoProducto } from './entities/estado-producto.entity';
import { TipoProducto } from './entities/tipo-producto.entity';
import { Producto } from './entities/producto.entity';
import { ContratoArriendo } from './entities/contrato-arriendo.entity';
import { EstadoCuota } from './entities/estado-cuota.entity';
import { Cuota } from './entities/cuota.entity';
import { TipoMovimiento } from './entities/tipo-movimiento.entity';
import { CuentaCorriente } from './entities/cuenta-corriente.entity';
import { TipoCobranza } from './entities/tipo-cobranza.entity';
import { Cobranza } from './entities/cobranza.entity';
import { CartaAviso } from './entities/carta-aviso.entity';
import { CuponPago } from './entities/cupon-pago.entity';
import { CuotaCuponPago } from './entities/cuota-cupon-pago.entity';
import { PagoTgr } from './entities/pago-tgr.entity';
import { Resolucion } from './entities/resolucion.entity';
import { ProdResol } from './entities/prod-resol.entity';
import { AdjuntoProducto } from './entities/adjunto-producto.entity';
import { Fiscalizacion } from './entities/fiscalizacion.entity';
import { Perfil } from './entities/perfil.entity';
import { Usuario } from './entities/usuario.entity';
import { IndiceIpc } from './entities/indice-ipc.entity';
import { ValorUf } from './entities/valor-uf.entity';
import { InteresPenal } from './entities/interes-penal.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CargaBanco } from './entities/carga-banco.entity';

export const ALL_ENTITIES = [
  Region, Provincia, Comuna, TipoCliente, Cliente, Persona, Empresa,
  Domicilio, Contacto, Inmueble, EstadoProducto, TipoProducto, Producto,
  ContratoArriendo, EstadoCuota, Cuota, TipoMovimiento, CuentaCorriente,
  TipoCobranza, Cobranza, CartaAviso, CuponPago, CuotaCuponPago, PagoTgr,
  Resolucion, ProdResol, AdjuntoProducto, Fiscalizacion, Perfil, Usuario,
  IndiceIpc, ValorUf, InteresPenal, AuditLog, CargaBanco,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): any => ({
        type: config.get<any>('DB_TYPE', 'postgres'),
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'sicar'),
        password: config.get('DB_PASSWORD', 'sicar123'),
        database: config.get('DB_NAME', 'sicar_v2'),
        entities: ALL_ENTITIES,
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        logging: config.get('DB_LOGGING', 'false') === 'true',
        ssl: config.get('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
