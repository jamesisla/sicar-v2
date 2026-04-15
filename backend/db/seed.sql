-- ============================================================
-- SICAR v2 — Datos semilla para desarrollo/testing
-- ============================================================

-- Catálogos base
INSERT INTO region (id, numeral, nombre, nombre_corto) VALUES
  (1,  'I',    'Región de Tarapacá',              'Tarapacá'),
  (2,  'II',   'Región de Antofagasta',            'Antofagasta'),
  (3,  'III',  'Región de Atacama',                'Atacama'),
  (4,  'IV',   'Región de Coquimbo',               'Coquimbo'),
  (5,  'V',    'Región de Valparaíso',             'Valparaíso'),
  (6,  'VI',   'Región del Libertador B. O''Higgins','O''Higgins'),
  (7,  'VII',  'Región del Maule',                 'Maule'),
  (8,  'VIII', 'Región del Biobío',                'Biobío'),
  (9,  'IX',   'Región de La Araucanía',           'Araucanía'),
  (10, 'X',    'Región de Los Lagos',              'Los Lagos'),
  (11, 'XI',   'Región de Aysén',                  'Aysén'),
  (12, 'XII',  'Región de Magallanes',             'Magallanes'),
  (13, 'RM',   'Región Metropolitana de Santiago', 'Metropolitana'),
  (14, 'XIV',  'Región de Los Ríos',               'Los Ríos'),
  (15, 'XV',   'Región de Arica y Parinacota',     'Arica'),
  (16, 'XVI',  'Región de Ñuble',                  'Ñuble'),
  (90, 'NAC',  'Nacional',                         'Nacional')
ON CONFLICT (id) DO NOTHING;

INSERT INTO provincia (id, nombre, region_id) VALUES
  (1, 'Santiago', 13),
  (2, 'Cordillera', 13),
  (3, 'Valparaíso', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO comuna (id, nombre, region_id, provincia_id) VALUES
  (1,  'Santiago',       13, 1),
  (2,  'Providencia',    13, 1),
  (3,  'Las Condes',     13, 1),
  (4,  'Maipú',          13, 1),
  (5,  'Puente Alto',    13, 2),
  (6,  'Valparaíso',     5,  3),
  (7,  'Viña del Mar',   5,  3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tipo_cliente (id, descripcion) VALUES
  (1, 'Persona Natural'),
  (2, 'Persona Jurídica')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tipo_producto (id, nombre) VALUES
  (1, 'Arriendo'),
  (2, 'Venta'),
  (3, 'Concesión')
ON CONFLICT (id) DO NOTHING;

INSERT INTO estado_producto (id, nombre) VALUES
  (1, 'Activo'),
  (2, 'En Proceso'),
  (3, 'Terminado'),
  (4, 'Suspendido'),
  (5, 'Moroso'),
  (6, 'En CDE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO estado_cuota (id, nombre) VALUES
  (0, 'Pendiente'),
  (1, 'Vigente'),
  (2, 'Pagada'),
  (3, 'Vencida'),
  (4, 'En Convenio'),
  (5, 'Anulada'),
  (6, 'Futura')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tipo_movimiento (id, nombre, cuenta_cargo, cuenta_abono) VALUES
  (1, 'Pago Banco Estado',    '1101', '4101'),
  (2, 'Pago TGR',             '1101', '4101'),
  (3, 'Pago Manual',          '1101', '4101'),
  (4, 'Cargo Reajuste',       '4201', '1101'),
  (5, 'Cargo Interés',        '4202', '1101'),
  (6, 'Ajuste',               '1101', '4101'),
  (7, 'Abono Convenio',       '1101', '4101')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tipo_cobranza (id, nombre) VALUES
  (1, 'Administrativa'),
  (2, 'Financiera'),
  (3, 'Extrajudicial'),
  (4, 'Judicial')
ON CONFLICT (id) DO NOTHING;

INSERT INTO perfil (id, nombre) VALUES
  (1, 'Administrador'),
  (2, 'Operador Nacional'),
  (3, 'Operador Regional'),
  (4, 'Supervisor'),
  (99, 'Cliente Portal')
ON CONFLICT (id) DO NOTHING;

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuario (id, perfil_id, nombre, apellido_paterno, rut, dv, region_id, estado, login, password, correo)
VALUES (1, 1, 'Admin', 'Sistema', 11111111, '1', 90, 1, 'admin',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'admin@sicar.cl')
ON CONFLICT (id) DO NOTHING;

-- Índices IPC de ejemplo
INSERT INTO indice_ipc (mes, agno, valor_indice, variacion) VALUES
  (1, 2024, 128.50, 0.5),
  (2, 2024, 129.10, 0.47),
  (3, 2024, 129.80, 0.54),
  (4, 2024, 130.20, 0.31),
  (1, 2025, 132.10, 0.45),
  (2, 2025, 132.80, 0.53),
  (3, 2025, 133.50, 0.53)
ON CONFLICT (mes, agno) DO NOTHING;

-- Valores UF de ejemplo
INSERT INTO valor_uf (fecha, valor) VALUES
  ('2025-01-01', 38500.00),
  ('2025-02-01', 38650.00),
  ('2025-03-01', 38800.00),
  ('2025-04-01', 38950.00)
ON CONFLICT (fecha) DO NOTHING;

-- Cliente de ejemplo
INSERT INTO cliente (id, tipo_cliente_id, nombre, rut, dv, fono_contacto, mail_contacto, region_id)
VALUES (1, 1, 'Juan Pérez González', 12345678, '5', '+56912345678', 'juan.perez@ejemplo.cl', 13)
ON CONFLICT (id) DO NOTHING;

INSERT INTO persona (cliente_id, rut, dv, nombre, apellido_paterno, apellido_materno)
VALUES (1, 12345678, '5', 'Juan', 'Pérez', 'González')
ON CONFLICT (cliente_id) DO NOTHING;

-- Inmueble de ejemplo
INSERT INTO inmueble (id, region_id, comuna_id, nombre_calle, numero_calle, rol_sii, estado)
VALUES (1, 13, 1, 'Av. Libertador Bernardo O''Higgins', '1234', '1234-5', 1)
ON CONFLICT (id) DO NOTHING;

-- Producto / Contrato de ejemplo
INSERT INTO producto (id, estado_producto_id, cliente_id, inmueble_id, tipo_producto_id, fch_inicio, region_id, monto_total, numero_cuotas)
VALUES (1, 1, 1, 1, 1, '2024-01-01', 13, 150000, 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO contrato_arriendo (producto_id, tipo_uso_id, fch_primera_cuota, fch_firma, canon_arriendo, numero_expediente)
VALUES (1, 1, '2024-02-01', '2024-01-15', 150000, 'EXP-2024-001')
ON CONFLICT (producto_id) DO NOTHING;

-- Cuotas de ejemplo
INSERT INTO cuota (producto_id, estado_cuota_id, fch_vencimiento, monto, usuario_creacion)
SELECT 1, 
  CASE WHEN fch <= NOW() THEN 3 ELSE 1 END,
  fch::DATE,
  150000,
  1
FROM generate_series('2024-02-01'::date, '2024-12-01'::date, '1 month'::interval) AS fch
ON CONFLICT DO NOTHING;

-- Actualizar secuencias
SELECT setval('region_id_seq', (SELECT MAX(id) FROM region));
SELECT setval('provincia_id_seq', (SELECT MAX(id) FROM provincia));
SELECT setval('comuna_id_seq', (SELECT MAX(id) FROM comuna));
SELECT setval('tipo_cliente_id_seq', (SELECT MAX(id) FROM tipo_cliente));
SELECT setval('tipo_producto_id_seq', (SELECT MAX(id) FROM tipo_producto));
SELECT setval('estado_producto_id_seq', (SELECT MAX(id) FROM estado_producto));
SELECT setval('estado_cuota_id_seq', (SELECT MAX(id) FROM estado_cuota));
SELECT setval('tipo_movimiento_id_seq', (SELECT MAX(id) FROM tipo_movimiento));
SELECT setval('tipo_cobranza_id_seq', (SELECT MAX(id) FROM tipo_cobranza));
SELECT setval('perfil_id_seq', (SELECT MAX(id) FROM perfil));
SELECT setval('usuario_id_seq', (SELECT MAX(id) FROM usuario));
SELECT setval('cliente_id_seq', (SELECT MAX(id) FROM cliente));
SELECT setval('inmueble_id_seq', (SELECT MAX(id) FROM inmueble));
SELECT setval('producto_id_seq', (SELECT MAX(id) FROM producto));
