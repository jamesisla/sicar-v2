'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { api } from '../../../lib/api';

interface Inmueble {
  id: number;
  nombreCalle: string; numeroCalle: string; block: string; deptoOficina: string; villaLocalidad: string;
  rolSii: string; carpeta: string; porcion: string; idCatastral: string;
  superficieConstruida: number; superficieTotal: number;
  avaluoFiscal: number; tasacionComercial: number;
  conservador: string; fojas: string; numeroInscripcion: string; agnoInscripcion: number;
  estado: number;
  region: { nombre: string };
  comuna: { nombre: string };
}

interface Contrato {
  id: number; montoTotal: number; fchInicio: string;
  estadoProducto: { nombre: string };
  tipoProducto: { nombre: string };
  cliente: { nombre: string; rut: number; dv: string };
  contrato: { numeroExpediente: string } | null;
}

const estadoBadge: Record<string, string> = {
  'Activo': 'badge-green', 'Moroso': 'badge-red',
  'En CDE': 'badge-purple', 'Terminado': 'badge-gray',
  'Suspendido': 'badge-yellow', 'En Proceso': 'badge-blue',
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
        {label}
      </p>
      <p style={{ fontSize: '13px', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function InmuebleDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inmueble, setInmueble] = useState<Inmueble | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Inmueble>(`/inmuebles/${id}`),
      api.get<{ rows: Contrato[] }>(`/contratos?inmueble=${id}`),
    ])
      .then(([inm, ctrs]) => {
        setInmueble(inm);
        // Filtrar contratos de este inmueble en el frontend si el backend no lo soporta
        setContratos(ctrs.rows || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver
        </button>

        {loading && <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Cargando...</div>}
        {error && <div className="alert alert-error" style={{ maxWidth: '600px' }}>{error}</div>}

        {inmueble && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
                background: 'hsl(142 71% 45% / 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(142 71% 32%)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {inmueble.nombreCalle} {inmueble.numeroCalle}
                  </h1>
                  <span className={`badge ${inmueble.estado === 1 ? 'badge-green' : 'badge-gray'}`}>
                    {inmueble.estado === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                  {[inmueble.villaLocalidad, inmueble.comuna?.nombre, inmueble.region?.nombre].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Sup. construida', value: inmueble.superficieConstruida ? `${Number(inmueble.superficieConstruida).toLocaleString('es-CL')} m²` : '—' },
                { label: 'Sup. total',      value: inmueble.superficieTotal      ? `${Number(inmueble.superficieTotal).toLocaleString('es-CL')} m²`      : '—' },
                { label: 'Avalúo fiscal',   value: inmueble.avaluoFiscal         ? `$${Number(inmueble.avaluoFiscal).toLocaleString('es-CL')}`            : '—' },
                { label: 'Tasación com.',   value: inmueble.tasacionComercial    ? `$${Number(inmueble.tasacionComercial).toLocaleString('es-CL')}`       : '—' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '900px' }}>

              {/* Ubicación */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Ubicación
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Dirección"    value={`${inmueble.nombreCalle} ${inmueble.numeroCalle || ''}`} />
                  <Field label="Block / Depto" value={[inmueble.block, inmueble.deptoOficina].filter(Boolean).join(' / ') || null} />
                  <Field label="Villa / Localidad" value={inmueble.villaLocalidad} />
                  <Field label="Comuna"       value={inmueble.comuna?.nombre} />
                  <Field label="Región"       value={inmueble.region?.nombre} />
                </div>
              </div>

              {/* Identificación */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Identificación
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Rol SII"      value={inmueble.rolSii} />
                  <Field label="Carpeta"      value={inmueble.carpeta} />
                  <Field label="Porción"      value={inmueble.porcion} />
                  <Field label="ID Catastral" value={inmueble.idCatastral} />
                </div>
              </div>

              {/* Inscripción */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Inscripción conservador
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Conservador"    value={inmueble.conservador} />
                  <Field label="Fojas"          value={inmueble.fojas} />
                  <Field label="N° Inscripción" value={inmueble.numeroInscripcion} />
                  <Field label="Año"            value={inmueble.agnoInscripcion} />
                </div>
              </div>

              {/* Contratos asociados */}
              <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Contratos asociados
                </h3>
                {contratos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contratos registrados para este inmueble</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Expediente</th>
                        <th>Tipo</th>
                        <th>Cliente</th>
                        <th>Inicio</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>
                            {(c as any).contrato?.numeroExpediente || '—'}
                          </td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.tipoProducto?.nombre}</td>
                          <td style={{ fontWeight: 500 }}>{c.cliente?.nombre}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {c.fchInicio ? new Date(c.fchInicio).toLocaleDateString('es-CL') : '—'}
                          </td>
                          <td style={{ fontWeight: 500 }}>${Number(c.montoTotal).toLocaleString('es-CL')}</td>
                          <td>
                            <span className={`badge ${estadoBadge[c.estadoProducto?.nombre] || 'badge-gray'}`}>
                              {c.estadoProducto?.nombre}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <a href={`/contratos/${c.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                              Ver →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
