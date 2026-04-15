-- ============================================================
-- SICAR v2 — Schema PostgreSQL
-- Basado en el modelo entidad-relación del sistema SICAR original
-- ============================================================

-- Tablas de referencia / catálogos
CREATE TABLE IF NOT EXISTS region (
  id          SERIAL PRIMARY KEY,
  numeral     VARCHAR(4),
  nombre      VARCHAR(100) NOT NULL,
  nombre_corto VARCHAR(13)
);

CREATE TABLE IF NOT EXISTS provincia (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  region_id   INTEGER NOT NULL REFERENCES region(id)
);

CREATE TABLE IF NOT EXISTS comuna (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  region_id   INTEGER NOT NULL REFERENCES region(id),
  provincia_id INTEGER NOT NULL REFERENCES provincia(id)
);

CREATE TABLE IF NOT EXISTS tipo_cliente (
  id          SERIAL PRIMARY KEY,
  descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo_producto (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_producto (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_cuota (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo_movimiento (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(50) NOT NULL,
  cuenta_cargo  VARCHAR(10),
  cuenta_abono  VARCHAR(10),
  observacion   VARCHAR(200),
  cta_banco     VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS tipo_cobranza (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS perfil (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL
);

-- Clientes
CREATE TABLE IF NOT EXISTS cliente (
  id                  SERIAL PRIMARY KEY,
  tipo_cliente_id     INTEGER NOT NULL REFERENCES tipo_cliente(id),
  nombre              VARCHAR(200) NOT NULL,
  rut                 BIGINT NOT NULL,
  dv                  VARCHAR(1) NOT NULL,
  fono_contacto       VARCHAR(50),
  mail_contacto       VARCHAR(50),
  ingreso_mes         NUMERIC(15),
  nombre_calle        VARCHAR(300),
  numero_calle        VARCHAR(10),
  depto               VARCHAR(5),
  block               VARCHAR(5),
  villa_localidad     VARCHAR(50),
  fax                 VARCHAR(20),
  password            VARCHAR(255),
  comuna_id           INTEGER REFERENCES comuna(id),
  fch_actualizada     TIMESTAMP DEFAULT NOW(),
  usuario_actualiza   INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cliente_rut ON cliente(rut);

CREATE TABLE IF NOT EXISTS persona (
  cliente_id          INTEGER PRIMARY KEY REFERENCES cliente(id),
  rut                 BIGINT,
  dv                  VARCHAR(1),
  nombre              VARCHAR(50),
  apellido_paterno    VARCHAR(50),
  apellido_materno    VARCHAR(50),
  profesion           VARCHAR(50),
  email               VARCHAR(50),
  sexo                VARCHAR(1),
  nacionalidad_id     INTEGER,
  estado_civil_id     INTEGER,
  fch_actualiza       TIMESTAMP DEFAULT NOW(),
  usuario_actualiza   INTEGER
);

CREATE TABLE IF NOT EXISTS empresa (
  cliente_id          INTEGER PRIMARY KEY REFERENCES cliente(id),
  razon_social        VARCHAR(200),
  giro                VARCHAR(75),
  rut_rep_legal       BIGINT,
  dv_rep_legal        VARCHAR(1),
  nombre_rep_legal    VARCHAR(50),
  apellido_paterno_rep VARCHAR(50),
  apellido_materno_rep VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS domicilio (
  id                  SERIAL PRIMARY KEY,
  cliente_id          INTEGER NOT NULL REFERENCES cliente(id),
  comuna_id           INTEGER NOT NULL REFERENCES comuna(id),
  calle               VARCHAR(50),
  block               VARCHAR(5),
  depto_oficina       VARCHAR(5),
  villa_localidad     VARCHAR(45),
  fch_creacion        TIMESTAMP DEFAULT NOW(),
  usuario_creacion    INTEGER
);

CREATE TABLE IF NOT EXISTS contacto (
  id                  SERIAL PRIMARY KEY,
  cliente_id          INTEGER NOT NULL REFERENCES cliente(id),
  nombre              VARCHAR(100),
  cargo_relacion      VARCHAR(45),
  email               VARCHAR(45),
  numero_fijo         BIGINT,
  numero_movil        BIGINT
);

-- Inmuebles
CREATE TABLE IF NOT EXISTS inmueble (
  id                    SERIAL PRIMARY KEY,
  region_id             INTEGER NOT NULL REFERENCES region(id),
  comuna_id             INTEGER NOT NULL REFERENCES comuna(id),
  tipo_urbano_id        INTEGER,
  tipo_inmueble_id      INTEGER,
  rol_sii               VARCHAR(50),
  carpeta               VARCHAR(10),
  porcion               VARCHAR(5),
  plano                 VARCHAR(500),
  superficie_construida NUMERIC(15),
  superficie_total      NUMERIC(15),
  avaluo_fiscal         NUMERIC(15),
  tasacion_comercial    NUMERIC(15),
  nombre_calle          VARCHAR(300),
  numero_calle          VARCHAR(10),
  block                 VARCHAR(5),
  depto_oficina         VARCHAR(5),
  villa_localidad       VARCHAR(80),
  conservador           VARCHAR(75),
  fojas                 VARCHAR(15),
  numero_inscripcion    VARCHAR(15),
  agno_inscripcion      INTEGER,
  id_catastral          VARCHAR(100),
  estado                INTEGER DEFAULT 1,
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

-- Productos / Contratos
CREATE TABLE IF NOT EXISTS producto (
  id                    SERIAL PRIMARY KEY,
  estado_producto_id    INTEGER NOT NULL REFERENCES estado_producto(id),
  cliente_id            INTEGER NOT NULL REFERENCES cliente(id),
  inmueble_id           INTEGER NOT NULL REFERENCES inmueble(id),
  tipo_producto_id      INTEGER NOT NULL REFERENCES tipo_producto(id),
  fch_inicio            DATE,
  fch_termino           DATE,
  numero_cuotas         INTEGER,
  prid_resolucion       INTEGER,
  region_id             INTEGER NOT NULL,
  monto_total           NUMERIC(15,2) DEFAULT 0,
  renta_variable        VARCHAR(2),
  aviso_correo          INTEGER,
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

CREATE TABLE IF NOT EXISTS contrato_arriendo (
  producto_id           INTEGER PRIMARY KEY REFERENCES producto(id),
  periodo_cuota_id      INTEGER,
  tipo_uso_id           INTEGER,
  fch_primera_cuota     DATE,
  interes_penal         NUMERIC(8,3) DEFAULT 0,
  fch_firma             DATE,
  notificacion_cliente  DATE,
  aceptacion_cliente    INTEGER,
  tipo_base_calculo_id  INTEGER,
  aviso                 INTEGER,
  canon_arriendo        NUMERIC(15,2) DEFAULT 0,
  interes               NUMERIC(8,3) DEFAULT 0,
  numero_expediente     VARCHAR(30),
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contrato_expediente ON contrato_arriendo(numero_expediente);

CREATE TABLE IF NOT EXISTS resolucion (
  id                    SERIAL PRIMARY KEY,
  tipo_resolucion_id    INTEGER,
  anio_resolucion       INTEGER,
  fch_tramite           DATE,
  fch_resolucion        DATE,
  numero_resolucion     VARCHAR(10),
  adjunto               VARCHAR(200),
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

CREATE TABLE IF NOT EXISTS prod_resol (
  id                    SERIAL PRIMARY KEY,
  resolucion_id         INTEGER NOT NULL REFERENCES resolucion(id),
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  tipo_accion           INTEGER,
  causal_termino        VARCHAR(200),
  monto_adeudado        NUMERIC(15,2),
  fch_resolucion        DATE
);

CREATE TABLE IF NOT EXISTS adjunto_producto (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  tipo_adjunto_id       INTEGER NOT NULL,
  nombre                VARCHAR(100),
  ruta                  VARCHAR(50),
  estado                INTEGER DEFAULT 1,
  fch_subida            TIMESTAMP DEFAULT NOW(),
  usuario               INTEGER,
  nro_oficio_cde        INTEGER
);

CREATE TABLE IF NOT EXISTS fiscalizacion (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  tipo_fiscalizacion_id INTEGER,
  fch_fiscalizacion     DATE,
  nombre_fiscalizador   VARCHAR(50),
  apellido_paterno      VARCHAR(50),
  observacion           VARCHAR(300),
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

-- Cuotas
CREATE TABLE IF NOT EXISTS cuota (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  estado_cuota_id       INTEGER NOT NULL REFERENCES estado_cuota(id),
  fch_vencimiento       DATE NOT NULL,
  fch_reavaluo          DATE,
  aviso_cobranza        INTEGER,
  monto                 NUMERIC(15,2) DEFAULT 0,
  monto_reavaluo        NUMERIC(15,2) DEFAULT 0,
  cargo_reavaluo        NUMERIC(15,2) DEFAULT 0,
  cargo_interes         NUMERIC(15,2) DEFAULT 0,
  cargo_convenio        NUMERIC(15,2) DEFAULT 0,
  abono_pago            NUMERIC(15,2) DEFAULT 0,
  abono_convenio        NUMERIC(15,2) DEFAULT 0,
  multa                 NUMERIC(15,2) DEFAULT 0,
  prorroga              BOOLEAN DEFAULT FALSE,
  fch_pago              DATE,
  fch_creacion          TIMESTAMP DEFAULT NOW(),
  usuario_creacion      INTEGER,
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

CREATE INDEX IF NOT EXISTS idx_cuota_producto ON cuota(producto_id);
CREATE INDEX IF NOT EXISTS idx_cuota_estado ON cuota(estado_cuota_id);

-- Cuenta corriente
CREATE TABLE IF NOT EXISTS cuenta_corriente (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  tipo_movimiento_id    INTEGER NOT NULL REFERENCES tipo_movimiento(id),
  cargo_abono           INTEGER,
  fch_movimiento        DATE,
  monto_mov             NUMERIC(15,2) DEFAULT 0,
  centralizado_sigfe    INTEGER DEFAULT 0,
  fch_contable          DATE,
  id_cuota              INTEGER,
  id_cliente            INTEGER,
  anio_asiento          INTEGER,
  id_asiento_sigfe      INTEGER,
  fch_creacion          TIMESTAMP DEFAULT NOW(),
  usuario_creacion      INTEGER
);

CREATE INDEX IF NOT EXISTS idx_cc_producto ON cuenta_corriente(producto_id);

-- Cobranza
CREATE TABLE IF NOT EXISTS cobranza (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  tipo_cobranza_id      INTEGER NOT NULL REFERENCES tipo_cobranza(id),
  fch_cobranza          DATE,
  monto_cobrado         NUMERIC(15) DEFAULT 0,
  estado                INTEGER DEFAULT 0,
  cuotas_id             INTEGER,
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

CREATE TABLE IF NOT EXISTS carta_aviso (
  id                    SERIAL PRIMARY KEY,
  cobranza_id           INTEGER NOT NULL REFERENCES cobranza(id),
  numero_aviso          INTEGER NOT NULL,
  fch_aviso             DATE,
  usuario_aviso         INTEGER
);

-- Cupones de pago
CREATE TABLE IF NOT EXISTS cupon_pago (
  id                    SERIAL PRIMARY KEY,
  producto_id           INTEGER NOT NULL REFERENCES producto(id),
  cliente_id            INTEGER,
  folio                 VARCHAR(20),
  fch_emision           TIMESTAMP DEFAULT NOW(),
  fch_carga_pago        DATE,
  origen_carga          INTEGER,
  usuario_creacion      INTEGER,
  monto_reajuste        NUMERIC(15,2) DEFAULT 0,
  monto_interes         NUMERIC(15,2) DEFAULT 0,
  monto_convenio        NUMERIC(15,2) DEFAULT 0,
  monto_total           NUMERIC(15,2) DEFAULT 0,
  monto_arriendo        NUMERIC(15,2) DEFAULT 0,
  multa                 NUMERIC(15,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cuota_cupon_pago (
  id                    SERIAL PRIMARY KEY,
  cupon_pago_id         INTEGER NOT NULL REFERENCES cupon_pago(id),
  producto_id           INTEGER NOT NULL,
  cuota_id              INTEGER NOT NULL,
  tipo_mov_id           INTEGER,
  folio                 VARCHAR(20),
  monto                 NUMERIC(15,2) DEFAULT 0
);

-- Pagos TGR
CREATE TABLE IF NOT EXISTS pago_tgr (
  id                    SERIAL PRIMARY KEY,
  cupon_id              INTEGER,
  id_ext                VARCHAR(20),
  status                VARCHAR(20),
  id_operacion          VARCHAR(50) UNIQUE,
  id_transaccion        VARCHAR(50),
  folio                 INTEGER,
  vencimiento           DATE,
  total_pago            NUMERIC(15,2),
  fecha_pago            TIMESTAMP,
  resultado             VARCHAR(20),
  tipo_pago             VARCHAR(20),
  rut                   BIGINT
);

-- Carga banco
CREATE TABLE IF NOT EXISTS carga_banco (
  id                    SERIAL PRIMARY KEY,
  folio                 VARCHAR(20) UNIQUE NOT NULL,
  fecha                 DATE,
  oficina               INTEGER,
  carga_pago            INTEGER,
  fch_contable          DATE,
  monto                 NUMERIC(15,2) DEFAULT 0,
  exito                 BOOLEAN DEFAULT FALSE,
  tipo_cartera          VARCHAR(20) DEFAULT 'arriendo',
  fch_actualiza         TIMESTAMP
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuario (
  id                    SERIAL PRIMARY KEY,
  perfil_id             INTEGER NOT NULL REFERENCES perfil(id),
  nombre                VARCHAR(50),
  apellido_paterno      VARCHAR(50),
  apellido_materno      VARCHAR(50),
  rut                   BIGINT,
  dv                    VARCHAR(1),
  region_id             INTEGER,
  estado                INTEGER DEFAULT 1,
  login                 VARCHAR(10) UNIQUE NOT NULL,
  password              VARCHAR(255),
  correo                VARCHAR(50),
  token                 VARCHAR(200),
  fch_actualiza         TIMESTAMP DEFAULT NOW(),
  usuario_actualiza     INTEGER
);

-- Índices financieros
CREATE TABLE IF NOT EXISTS indice_ipc (
  id            SERIAL PRIMARY KEY,
  mes           INTEGER NOT NULL,
  agno          INTEGER NOT NULL,
  valor_indice  NUMERIC(5,2),
  variacion     NUMERIC(6,3),
  UNIQUE(mes, agno)
);

CREATE TABLE IF NOT EXISTS valor_uf (
  id      SERIAL PRIMARY KEY,
  fecha   DATE UNIQUE NOT NULL,
  valor   NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS interes_penal (
  id          SERIAL PRIMARY KEY,
  ip_mes      INTEGER NOT NULL,
  ip_year     INTEGER NOT NULL,
  interes_a   NUMERIC(5,2),
  interes_b   NUMERIC(5,2),
  interes_c   NUMERIC(5,2),
  UNIQUE(ip_mes, ip_year)
);

-- Auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  fch_operacion   TIMESTAMP DEFAULT NOW(),
  usuario_id      INTEGER,
  entidad         VARCHAR(50) NOT NULL,
  id_registro     VARCHAR(100) NOT NULL,
  operacion       VARCHAR(10) NOT NULL,
  valor_anterior  TEXT,
  valor_nuevo     TEXT,
  ip_cliente      VARCHAR(45),
  endpoint        VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log(entidad, id_registro);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_fecha   ON audit_log(fch_operacion);
