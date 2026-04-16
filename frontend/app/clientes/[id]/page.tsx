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
  persona: { nombre: string; apellidoPaterno: string; apellidoMaterno: string; profesion: string; email: string; sexo: string } | null;
  empresa: { razonSocial: string; giro: string; rutRepLegal: number; dvRepLegal: string; nombreRepLegal: string; apellidoPaternoRep: string } | null;
  domicilios: { id: number; calle: string; villaLocalidad: string; comuna: { nombre: string } }[];
  contactos: { id: number; nombre: string; cargoRelacion: string; email: string; numeroMovil: number }[];
  contratos: { id: number; montoTotal: number; fchInicio: string; numeroCuotas: number; estadoProducto: { nombre: string }; tipoProducto: { nombre: string }; inmueble: { nombreCalle: string; numeroCalle: string }; contrato: { numeroExpediente: string } | null }[];
}

const estadoBadge: Record<string, string> = {
  'Activo': 'badge-green', 'Moroso': 'badge-red', 'En CDE': 'badge-purple',
  'Terminado': 'badge-gray', 'Suspendido': 'badge-yellow', 'En Proceso': 'badge-blue',
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{value ?? '—'}</p>
    </div>
  );
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit mode
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Add domicilio
  const [showDomicilio, setShowDomicilio] = useState(false);
  const [domForm, setDomForm] = useState<any>({});

  // Add contacto
  const [showContacto, setShowContacto] = useState(false);
  const [conForm, setConForm] = useState<any>({});

  const reload = () => {
    setLoading(true);
    api.get<Detalle>(`/clientes/${id}`)
      .then(d => { setDetalle(d); setEditForm(buildEditForm(d)); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  function buildEditForm(d: Detalle) {
    return {
      nombre:                 d.cliente.nombre,
      fonoContacto:           d.cliente.fonoContacto || '',
      mailContacto:           d.cliente.mailContacto || '',
      ingresoMes:             d.cliente.ingresoMes || '',
      profesion:              d.persona?.profesion || '',
      sexo:                   d.persona?.sexo || '',
      giro:                   d.empresa?.giro || '',
      repLegalNombre:         d.empresa?.nombreRepLegal || '',
      repLegalApellidoPaterno:d.empresa?.apellidoPaternoRep || '',
    };
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/clientes/${id}`, {
        ...editForm,
        ingresoMes: editForm.ingresoMes ? Number(editForm.ingresoMes) : undefined,
      });
      setSuccess('Cliente actualizado correctamente');
      setEditando(false);
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDesactivar() {
    if (!confirm('¿Desactivar este cliente? No podrá crear nuevos contratos.')) return;
    try {
      await api.put(`/clientes/${id}/desactivar`, {});
      setSuccess('Cliente desactivado');
      reload();
    } catch (e: any) { setError(e.message); }
  }

  async function handleAddDomicilio(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post(`/clientes/${id}/domicilios`, { ...domForm, comunaId: Number(domForm.comunaId) });
      setSuccess('Domicilio agregado'); setShowDomicilio(false); setDomForm({});
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDeleteDomicilio(domicilioId: number) {
    if (!confirm('¿Eliminar este domicilio?')) return;
    try {
      await api.delete(`/clientes/${id}/domicilios/${domicilioId}`);
      setSuccess('Domicilio eliminado'); reload();
    } catch (e: any) { setError(e.message); }
  }

  async function handleAddContacto(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post(`/clientes/${id}/contactos`, { ...conForm, numeroMovil: conForm.numeroMovil ? Number(conForm.numeroMovil) : undefined });
      setSuccess('Contacto agregado'); setShowContacto(false); setConForm({});
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDeleteContacto(contactoId: number) {
    if (!confirm('¿Eliminar este contacto?')) return;
    try {
      await api.delete(`/clientes/${id}/contactos/${contactoId}`);
      setSuccess('Contacto eliminado'); reload();
    } catch (e: any) { setError(e.message); }
  }

  const esNatural = detalle?.cliente?.tipoCliente?.id === 1;
  const ef = (k: string, v: string) => setEditForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver
        </button>

        {loading && <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Cargando...</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: '16px', maxWidth: '600px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '16px', maxWidth: '600px' }}>{success}</div>}

        {detalle && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0, background: esNatural ? 'hsl(221 83% 53% / 0.1)' : 'hsl(262 83% 58% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: esNatural ? 'hsl(221 83% 45%)' : 'hsl(262 83% 45%)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {esNatural ? <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> : <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>}
                  </svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{detalle.cliente.nombre}</h1>
                    <span className={`badge ${esNatural ? 'badge-blue' : 'badge-purple'}`}>{detalle.cliente.tipoCliente?.descripcion}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>RUT {detalle.cliente.rut}-{detalle.cliente.dv}{detalle.cliente.comuna && ` · ${detalle.cliente.comuna.nombre}`}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setEditando(!editando); setError(''); }} className={`btn ${editando ? 'btn-secondary' : 'btn-primary'}`}>
                  {editando ? 'Cancelar' : (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar</>
                  )}
                </button>
                <button onClick={handleDesactivar} className="btn btn-secondary" style={{ color: 'hsl(0 72% 45%)' }}>
                  Desactivar
                </button>
              </div>
            </div>

            {/* Formulario edición */}
            {editando && (
              <div className="card" style={{ padding: '20px', marginBottom: '20px', maxWidth: '640px', border: '2px solid hsl(221 83% 53% / 0.3)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Editar datos del cliente</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Nombre completo</label>
                    <input type="text" value={editForm.nombre || ''} onChange={e => ef('nombre', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Teléfono</label>
                    <input type="text" value={editForm.fonoContacto || ''} onChange={e => ef('fonoContacto', e.target.value)} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input type="email" value={editForm.mailContacto || ''} onChange={e => ef('mailContacto', e.target.value)} className="form-input" />
                  </div>
                  {esNatural && (
                    <>
                      <div>
                        <label className="form-label">Ingreso mensual ($)</label>
                        <input type="number" value={editForm.ingresoMes || ''} onChange={e => ef('ingresoMes', e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Profesión</label>
                        <input type="text" value={editForm.profesion || ''} onChange={e => ef('profesion', e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Sexo</label>
                        <select value={editForm.sexo || ''} onChange={e => ef('sexo', e.target.value)} className="form-input">
                          <option value="">—</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </>
                  )}
                  {!esNatural && (
                    <>
                      <div>
                        <label className="form-label">Giro</label>
                        <input type="text" value={editForm.giro || ''} onChange={e => ef('giro', e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Nombre Rep. Legal</label>
                        <input type="text" value={editForm.repLegalNombre || ''} onChange={e => ef('repLegalNombre', e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Apellido Rep. Legal</label>
                        <input type="text" value={editForm.repLegalApellidoPaterno || ''} onChange={e => ef('repLegalApellidoPaterno', e.target.value)} className="form-input" />
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                  <button onClick={() => setEditando(false)} className="btn btn-secondary">Cancelar</button>
                </div>
              </div>
            )}

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domicilios ({detalle.domicilios.length})</h2>
                  <button onClick={() => setShowDomicilio(!showDomicilio)} className="btn btn-secondary btn-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Agregar
                  </button>
                </div>
                {showDomicilio && (
                  <form onSubmit={handleAddDomicilio} style={{ marginBottom: '12px', padding: '12px', background: 'hsl(var(--muted)/0.5)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Calle" onChange={e => setDomForm((p: any) => ({ ...p, calle: e.target.value }))} className="form-input" required />
                    <input type="text" placeholder="Villa / Localidad" onChange={e => setDomForm((p: any) => ({ ...p, villaLocalidad: e.target.value }))} className="form-input" />
                    <input type="number" placeholder="ID Comuna" onChange={e => setDomForm((p: any) => ({ ...p, comunaId: e.target.value }))} className="form-input" required />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="submit" disabled={saving} className="btn btn-primary btn-sm">Guardar</button>
                      <button type="button" onClick={() => setShowDomicilio(false)} className="btn btn-secondary btn-sm">Cancelar</button>
                    </div>
                  </form>
                )}
                {detalle.domicilios.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin domicilios</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detalle.domicilios.map(d => (
                      <div key={d.id} style={{ padding: '10px 12px', background: 'hsl(var(--muted)/0.5)', borderRadius: '7px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500 }}>{d.calle}</p>
                          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{[d.villaLocalidad, d.comuna?.nombre].filter(Boolean).join(' · ')}</p>
                        </div>
                        <button onClick={() => handleDeleteDomicilio(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(0 72% 45%)', padding: '2px' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contactos */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contactos ({detalle.contactos.length})</h2>
                  <button onClick={() => setShowContacto(!showContacto)} className="btn btn-secondary btn-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Agregar
                  </button>
                </div>
                {showContacto && (
                  <form onSubmit={handleAddContacto} style={{ marginBottom: '12px', padding: '12px', background: 'hsl(var(--muted)/0.5)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="text" placeholder="Nombre" onChange={e => setConForm((p: any) => ({ ...p, nombre: e.target.value }))} className="form-input" required />
                    <input type="text" placeholder="Cargo / Relación" onChange={e => setConForm((p: any) => ({ ...p, cargoRelacion: e.target.value }))} className="form-input" />
                    <input type="email" placeholder="Email" onChange={e => setConForm((p: any) => ({ ...p, email: e.target.value }))} className="form-input" />
                    <input type="text" placeholder="Teléfono móvil" onChange={e => setConForm((p: any) => ({ ...p, numeroMovil: e.target.value }))} className="form-input" />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="submit" disabled={saving} className="btn btn-primary btn-sm">Guardar</button>
                      <button type="button" onClick={() => setShowContacto(false)} className="btn btn-secondary btn-sm">Cancelar</button>
                    </div>
                  </form>
                )}
                {detalle.contactos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contactos</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detalle.contactos.map(c => (
                      <div key={c.id} style={{ padding: '10px 12px', background: 'hsl(var(--muted)/0.5)', borderRadius: '7px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 500 }}>{c.nombre}</p>
                          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{c.cargoRelacion}</p>
                          {c.email && <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{c.email}</p>}
                        </div>
                        <button onClick={() => handleDeleteContacto(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(0 72% 45%)', padding: '2px' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contratos */}
              <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contratos ({detalle.contratos.length})</h2>
                {detalle.contratos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contratos</p>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Expediente</th><th>Tipo</th><th>Inmueble</th><th>Inicio</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
                    <tbody>
                      {detalle.contratos.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{(c as any).contrato?.numeroExpediente || '—'}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.tipoProducto?.nombre}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.inmueble?.nombreCalle} {c.inmueble?.numeroCalle}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.fchInicio ? new Date(c.fchInicio).toLocaleDateString('es-CL') : '—'}</td>
                          <td style={{ fontWeight: 500 }}>${Number(c.montoTotal).toLocaleString('es-CL')}</td>
                          <td><span className={`badge ${estadoBadge[c.estadoProducto?.nombre] || 'badge-gray'}`}>{c.estadoProducto?.nombre}</span></td>
                          <td style={{ textAlign: 'right' }}><a href={`/contratos/${c.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>Ver →</a></td>
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
