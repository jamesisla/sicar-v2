'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { api } from '../../../lib/api';

interface Inmueble {
  id: number; nombreCalle: string; numeroCalle: string; block: string; deptoOficina: string; villaLocalidad: string;
  rolSii: string; carpeta: string; porcion: string; idCatastral: string;
  superficieConstruida: number; superficieTotal: number; avaluoFiscal: number; tasacionComercial: number;
  conservador: string; fojas: string; numeroInscripcion: string; agnoInscripcion: number; estado: number;
  region: { nombre: string }; comuna: { nombre: string };
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

export default function InmuebleDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inmueble, setInmueble] = useState<Inmueble | null>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    Promise.all([
      api.get<Inmueble>(`/inmuebles/${id}`),
      api.get<{ rows: any[] }>(`/contratos?inmueble=${id}`),
    ])
      .then(([inm, ctrs]) => { setInmueble(inm); setContratos(ctrs.rows || []); setEditForm(buildForm(inm)); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  function buildForm(inm: Inmueble) {
    return {
      nombreCalle: inm.nombreCalle || '', numeroCalle: inm.numeroCalle || '',
      villaLocalidad: inm.villaLocalidad || '', rolSii: inm.rolSii || '',
      carpeta: inm.carpeta || '', porcion: inm.porcion || '', idCatastral: inm.idCatastral || '',
      superficieConstruida: inm.superficieConstruida || '', superficieTotal: inm.superficieTotal || '',
      avaluoFiscal: inm.avaluoFiscal || '', tasacionComercial: inm.tasacionComercial || '',
      conservador: inm.conservador || '', fojas: inm.fojas || '',
      numeroInscripcion: inm.numeroInscripcion || '', agnoInscripcion: inm.agnoInscripcion || '',
    };
  }

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/inmuebles/${id}`, {
        ...editForm,
        superficieConstruida: editForm.superficieConstruida ? Number(editForm.superficieConstruida) : undefined,
        superficieTotal:      editForm.superficieTotal      ? Number(editForm.superficieTotal)      : undefined,
        avaluoFiscal:         editForm.avaluoFiscal         ? Number(editForm.avaluoFiscal)         : undefined,
        tasacionComercial:    editForm.tasacionComercial    ? Number(editForm.tasacionComercial)    : undefined,
        agnoInscripcion:      editForm.agnoInscripcion      ? Number(editForm.agnoInscripcion)      : undefined,
      });
      setSuccess('Inmueble actualizado'); setEditando(false); reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDesactivar() {
    if (!confirm('¿Desactivar este inmueble?')) return;
    try {
      await api.put(`/inmuebles/${id}/desactivar`, {});
      setSuccess('Inmueble desactivado'); reload();
    } catch (e: any) { setError(e.message); }
  }

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

        {inmueble && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0, background: 'hsl(142 71% 45% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(142 71% 32%)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{inmueble.nombreCalle} {inmueble.numeroCalle}</h1>
                    <span className={`badge ${inmueble.estado === 1 ? 'badge-green' : 'badge-gray'}`}>{inmueble.estado === 1 ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{[inmueble.villaLocalidad, inmueble.comuna?.nombre, inmueble.region?.nombre].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setEditando(!editando); setError(''); }} className={`btn ${editando ? 'btn-secondary' : 'btn-primary'}`}>
                  {editando ? 'Cancelar' : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar</>}
                </button>
                {inmueble.estado === 1 && (
                  <button onClick={handleDesactivar} className="btn btn-secondary" style={{ color: 'hsl(0 72% 45%)' }}>Desactivar</button>
                )}
              </div>
            </div>

            {/* Formulario edición */}
            {editando && (
              <div className="card" style={{ padding: '20px', marginBottom: '20px', maxWidth: '720px', border: '2px solid hsl(221 83% 53% / 0.3)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Editar inmueble</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Calle</label><input type="text" value={editForm.nombreCalle} onChange={e => ef('nombreCalle', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Número</label><input type="text" value={editForm.numeroCalle} onChange={e => ef('numeroCalle', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Villa / Localidad</label><input type="text" value={editForm.villaLocalidad} onChange={e => ef('villaLocalidad', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Rol SII</label><input type="text" value={editForm.rolSii} onChange={e => ef('rolSii', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Carpeta</label><input type="text" value={editForm.carpeta} onChange={e => ef('carpeta', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Porción</label><input type="text" value={editForm.porcion} onChange={e => ef('porcion', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">ID Catastral</label><input type="text" value={editForm.idCatastral} onChange={e => ef('idCatastral', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Sup. construida (m²)</label><input type="number" value={editForm.superficieConstruida} onChange={e => ef('superficieConstruida', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Sup. total (m²)</label><input type="number" value={editForm.superficieTotal} onChange={e => ef('superficieTotal', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Avalúo fiscal ($)</label><input type="number" value={editForm.avaluoFiscal} onChange={e => ef('avaluoFiscal', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Tasación comercial ($)</label><input type="number" value={editForm.tasacionComercial} onChange={e => ef('tasacionComercial', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Conservador</label><input type="text" value={editForm.conservador} onChange={e => ef('conservador', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Fojas</label><input type="text" value={editForm.fojas} onChange={e => ef('fojas', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">N° Inscripción</label><input type="text" value={editForm.numeroInscripcion} onChange={e => ef('numeroInscripcion', e.target.value)} className="form-input" /></div>
                  <div><label className="form-label">Año inscripción</label><input type="number" value={editForm.agnoInscripcion} onChange={e => ef('agnoInscripcion', e.target.value)} className="form-input" /></div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                  <button onClick={() => setEditando(false)} className="btn btn-secondary">Cancelar</button>
                </div>
              </div>
            )}

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
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Ubicación</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Dirección" value={`${inmueble.nombreCalle} ${inmueble.numeroCalle || ''}`} />
                  <Field label="Villa / Localidad" value={inmueble.villaLocalidad} />
                  <Field label="Comuna" value={inmueble.comuna?.nombre} />
                  <Field label="Región" value={inmueble.region?.nombre} />
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Identificación</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Rol SII" value={inmueble.rolSii} />
                  <Field label="Carpeta" value={inmueble.carpeta} />
                  <Field label="Porción" value={inmueble.porcion} />
                  <Field label="ID Catastral" value={inmueble.idCatastral} />
                </div>
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Inscripción conservador</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Conservador" value={inmueble.conservador} />
                  <Field label="Fojas" value={inmueble.fojas} />
                  <Field label="N° Inscripción" value={inmueble.numeroInscripcion} />
                  <Field label="Año" value={inmueble.agnoInscripcion} />
                </div>
              </div>

              {/* Contratos */}
              <div className="card" style={{ padding: '20px', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Contratos asociados ({contratos.length})</h3>
                {contratos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Sin contratos</p>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Expediente</th><th>Tipo</th><th>Cliente</th><th>Inicio</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
                    <tbody>
                      {contratos.map((c: any) => (
                        <tr key={c.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{c.contrato?.numeroExpediente || '—'}</td>
                          <td style={{ color: 'hsl(var(--muted-foreground))' }}>{c.tipoProducto?.nombre}</td>
                          <td style={{ fontWeight: 500 }}>{c.cliente?.nombre}</td>
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
