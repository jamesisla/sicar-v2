'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

interface Inmueble {
  id: number;
  nombreCalle: string; numeroCalle: string; villaLocalidad: string;
  rolSii: string; superficieConstruida: number; superficieTotal: number;
  avaluoFiscal: number; tasacionComercial: number; estado: number;
  region: { id: number; nombre: string };
  comuna: { id: number; nombre: string };
}

interface Referencia {
  regiones: { id: number; nombre: string }[];
  comunas: { id: number; nombre: string; regionId: number }[];
}

export default function InmueblesPage() {
  const [results, setResults] = useState<Inmueble[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ nombre: '', rolSii: '', region: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [ref, setRef] = useState<Referencia>({ regiones: [], comunas: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar regiones y comunas al montar
  useEffect(() => {
    Promise.all([
      api.get<any[]>('/referencia/regiones'),
      api.get<any[]>('/referencia/comunas'),
    ]).then(([regiones, comunas]) => setRef({ regiones, comunas }))
      .catch(() => {});
  }, []);

  const comunasFiltradas = ref.comunas.filter(c =>
    !form.regionId || c.regionId === Number(form.regionId)
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.nombre)  params.set('nombre',  filters.nombre);
      if (filters.rolSii)  params.set('rolSii',  filters.rolSii);
      if (filters.region)  params.set('region',  filters.region);
      const data = await api.get<{ rows: Inmueble[] }>(`/inmuebles?${params}`);
      setResults(data.rows || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/inmuebles', {
        ...form,
        regionId:            Number(form.regionId),
        comunaId:            Number(form.comunaId),
        tipoUrbanoId:        Number(form.tipoUrbanoId   || 1),
        tipoInmuebleId:      Number(form.tipoInmuebleId || 1),
        superficieConstruida: form.superficieConstruida ? Number(form.superficieConstruida) : undefined,
        superficieTotal:      form.superficieTotal      ? Number(form.superficieTotal)      : undefined,
        avaluoFiscal:         form.avaluoFiscal         ? Number(form.avaluoFiscal)         : undefined,
        tasacionComercial:    form.tasacionComercial    ? Number(form.tasacionComercial)    : undefined,
        agnoInscripcion:      form.agnoInscripcion      ? Number(form.agnoInscripcion)      : undefined,
      });
      setSuccess('Inmueble creado exitosamente');
      setShowForm(false); setForm({});
      // Refrescar lista
      const data = await api.get<{ rows: Inmueble[] }>('/inmuebles');
      setResults(data.rows || []);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">Inmuebles</h1>
            <p className="page-subtitle">Catastro de inmuebles fiscales</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo inmueble
          </button>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Formulario nuevo inmueble */}
        {showForm && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Nuevo inmueble</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                {/* Ubicación */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Ubicación</p>
                </div>
                <div>
                  <label className="form-label">Región *</label>
                  <select value={form.regionId || ''} onChange={e => { f('regionId', e.target.value); f('comunaId', ''); }} className="form-input" required>
                    <option value="">Seleccione región</option>
                    {ref.regiones.filter(r => r.id !== 90).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Comuna *</label>
                  <select value={form.comunaId || ''} onChange={e => f('comunaId', e.target.value)} className="form-input" required disabled={!form.regionId}>
                    <option value="">Seleccione comuna</option>
                    {comunasFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Calle / Dirección *</label>
                  <input type="text" value={form.nombreCalle || ''} onChange={e => f('nombreCalle', e.target.value)} className="form-input" placeholder="Av. Libertador B. O'Higgins" required />
                </div>
                <div>
                  <label className="form-label">Número</label>
                  <input type="text" value={form.numeroCalle || ''} onChange={e => f('numeroCalle', e.target.value)} className="form-input" placeholder="1234" />
                </div>
                <div>
                  <label className="form-label">Villa / Localidad</label>
                  <input type="text" value={form.villaLocalidad || ''} onChange={e => f('villaLocalidad', e.target.value)} className="form-input" />
                </div>

                {/* Identificación */}
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Identificación</p>
                </div>
                <div>
                  <label className="form-label">Rol SII</label>
                  <input type="text" value={form.rolSii || ''} onChange={e => f('rolSii', e.target.value)} className="form-input" placeholder="1234-5" />
                </div>
                <div>
                  <label className="form-label">Carpeta</label>
                  <input type="text" value={form.carpeta || ''} onChange={e => f('carpeta', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Porción</label>
                  <input type="text" value={form.porcion || ''} onChange={e => f('porcion', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">ID Catastral</label>
                  <input type="text" value={form.idCatastral || ''} onChange={e => f('idCatastral', e.target.value)} className="form-input" />
                </div>

                {/* Superficies */}
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Superficies y valores</p>
                </div>
                <div>
                  <label className="form-label">Sup. construida (m²)</label>
                  <input type="number" value={form.superficieConstruida || ''} onChange={e => f('superficieConstruida', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Sup. total (m²)</label>
                  <input type="number" value={form.superficieTotal || ''} onChange={e => f('superficieTotal', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Avalúo fiscal ($)</label>
                  <input type="number" value={form.avaluoFiscal || ''} onChange={e => f('avaluoFiscal', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Tasación comercial ($)</label>
                  <input type="number" value={form.tasacionComercial || ''} onChange={e => f('tasacionComercial', e.target.value)} className="form-input" />
                </div>

                {/* Inscripción */}
                <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Inscripción conservador</p>
                </div>
                <div>
                  <label className="form-label">Conservador</label>
                  <input type="text" value={form.conservador || ''} onChange={e => f('conservador', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Fojas</label>
                  <input type="text" value={form.fojas || ''} onChange={e => f('fojas', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">N° Inscripción</label>
                  <input type="text" value={form.numeroInscripcion || ''} onChange={e => f('numeroInscripcion', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Año inscripción</label>
                  <input type="number" value={form.agnoInscripcion || ''} onChange={e => f('agnoInscripcion', e.target.value)} className="form-input" placeholder="2024" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Guardando...' : 'Guardar inmueble'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Búsqueda */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="text" value={filters.nombre} onChange={e => setFilters(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Buscar por calle..." className="form-input" style={{ paddingLeft: '32px' }} />
          </div>
          <div>
            <input type="text" value={filters.rolSii} onChange={e => setFilters(p => ({ ...p, rolSii: e.target.value }))}
              placeholder="Rol SII" className="form-input" style={{ width: '130px' }} />
          </div>
          <div>
            <select value={filters.region} onChange={e => setFilters(p => ({ ...p, region: e.target.value }))} className="form-input" style={{ width: 'auto' }}>
              <option value="">Todas las regiones</option>
              {ref.regiones.filter(r => r.id !== 90).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{results.length} inmueble{results.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dirección</th>
                  <th>Rol SII</th>
                  <th>Comuna</th>
                  <th>Región</th>
                  <th>Sup. total</th>
                  <th>Avalúo fiscal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>
                      {r.nombreCalle} {r.numeroCalle}
                      {r.villaLocalidad && <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}> · {r.villaLocalidad}</span>}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.rolSii || '—'}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.comuna?.nombre}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{r.region?.nombre}</td>
                    <td>{r.superficieTotal ? `${Number(r.superficieTotal).toLocaleString('es-CL')} m²` : '—'}</td>
                    <td>{r.avaluoFiscal ? `$${Number(r.avaluoFiscal).toLocaleString('es-CL')}` : '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={`/inmuebles/${r.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                        Ver →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && !loading && !showForm && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(var(--muted-foreground))' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.4 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <p style={{ fontSize: '14px' }}>Busque inmuebles por calle, rol SII o región</p>
          </div>
        )}
      </main>
    </div>
  );
}
