'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { api } from '../../../lib/api';

interface Detalle {
  cliente: {
    id: number; nombre: string; rut: number; dv: string;
    fonoContacto: string; mailContacto: string; ingresoMes: number;
    tipoCliente: { id: number; descripcion: string };
    comuna: { nombre: string } | null;
  };
  persona: {
    nombre: string; apellidoPaterno: string; apellidoMaterno: string;
    profesion: string; email: string; sexo: string;
  } | null;
  empresa: {
    razonSocial: string; giro: string;
    rutRepLegal: number; dvRepLegal: string;
    nombreRepLegal: string; apellidoPaternoRep: string;
  } | null;
  domicilios: { id: number; calle: string; villaLocalidad: string; comuna: { nombre: string } }[];
  contactos: { id: number; nombre: string; cargoRelacion: string; email: string; numeroMovil: number }[];
  contratos: {
    id: number; montoTotal: number; fchInicio: string; numeroCuotas: number;
    estadoProducto: { nombre: string };
    tipoProducto: { nombre: string };
    inmueble: { nombreCalle: string; numeroCalle: string };
    contrato: { numeroExpediente: string } | null;
  }[];
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
        {value || '—'}
      </p>
    </div>
  );
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Detalle>(`/clientes/${id}`)
      .then(setDetalle)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const esNatural = detalle?.cliente?.tipoCliente?.id === 1;

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

        {detalle && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                background: esNatural ? 'hsl(221 83% 53% / 0.12)' : 'hsl(262 83% 58% / 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: esNatural ? 'hsl(221 83% 45%)' : 'hsl(262 83% 45%)',
              }}>
                {esNatural ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>{detalle.cliente.nombre}</h1>
                  <span className={`badge ${esNatural ? 'badge-blue' : 'badge-purple'}`}>
                    {detalle.cliente.tipoCliente?.descripcion}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                  RUT {detalle.cliente.rut}-{detalle.cliente.dv}
                  {detalle.cliente.comuna && ` · ${detalle.cliente.comuna.nombre}`}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '900px' }}>

              {/* Datos principales */}
              <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {esNatural ? 'Datos personales' : 'Datos empresa'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                  {esNatural && detalle.persona ? (
                    <>
                      <Field label="Nombre" value={`${detalle.persona.nombre} ${detalle.persona.apellidoPaterno} ${detalle.persona.apellidoMaterno || ''}`} />
                      <Field label="Profesión" value={detalle.persona.profesion} />
                      <Field label="Email" value={detalle.persona.email || detalle.cliente.mailContacto} />
                      <Field label="Teléfono" value={detalle.cliente.fonoContacto} />
                      <Field label="Sexo" value={detalle.persona.sexo === 'M' ? 'Masculino' : detalle.persona.sexo === 'F' ? 'Femenino' : detalle.persona.sexo} />
                      <Field label="Ingreso mensual" value={detalle.cliente.ingresoMes ? `$${Number(detalle.cliente.ingresoMes).toLocaleString('es-CL')}` : undefined} />
                    </>
                  ) : detalle.empresa ? (
                    <>
                      <Field label="Razón social" value={detalle.empresa.razonSocial} />
                      <Field label="Giro" value={detalle.empresa.giro} />
                      <Field label="Email" value={detalle.cliente.mailContacto} />
                      <Field label="Teléfono" value={detalle.cliente.fonoContacto} />
                      <Field label="Rep. Legal" value={`${detalle.empresa.nombreRepLegal} ${detalle.empresa.apellidoPaternoRep}`} />
                      <Field label="RUT Rep. Legal" value={detalle.empresa.rutRepLegal ? `${detalle.empresa.rutRepLegal}-${detalle.empresa.dvRepLegal}` : undefined} />
                    </>
                  ) : (
                    <>
                      <Field label="Email" value={detalle.cliente.mailContacto} />
                      <Field label="Teléfono" value={detalle.cliente.fonoContacto} />
                    </>
                  )}
                </div>
              </div>

              {/* Domicilios */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Domicilios ({detalle.domicilios.length})
                </h2>
                {detalle.domicilios.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin domicilios registrados</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detalle.domicilios.map(d => (
                      <div key={d.id} style={{ padding: '10px 12px', background: 'hsl(var(--muted) / 0.5)', borderRadius: '7px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{d.calle}</p>
                        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                          {[d.villaLocalidad, d.comuna?.nombre].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contactos */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contactos ({detalle.contactos.length})
                </h2>
                {detalle.contactos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contactos registrados</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detalle.contactos.map(c => (
                      <div key={c.id} style={{ padding: '10px 12px', background: 'hsl(var(--muted) / 0.5)', borderRadius: '7px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500 }}>{c.nombre}</p>
                        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{c.cargoRelacion}</p>
                        {c.email && <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{c.email}</p>}
                        {c.numeroMovil && <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{c.numeroMovil}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contratos */}
              <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contratos ({detalle.contratos.length})
                </h2>
                {detalle.contratos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contratos registrados</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Expediente</th>
                        <th>Tipo</th>
                        <th>Inmueble</th>
                        <th>Inicio</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.contratos.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>
                            {(c as any).contrato?.numeroExpediente || '—'}
                          </td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.tipoProducto?.nombre}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {c.inmueble?.nombreCalle} {c.inmueble?.numeroCalle}
                          </td>
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
