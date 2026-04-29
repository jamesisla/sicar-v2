'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { validarRut } from '../../lib/validators/rut';
import { api } from '../../lib/api';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<'natural' | 'juridica'>('natural');
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('nombre', search);
      const data = await api.get<{ rows: any[] }>(`/clientes?${params}`);
      setResults(data.rows || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validarRut(parseInt(form.rut), form.dv)) {
      setError('Dígito verificador del RUT incorrecto');
      return;
    }
    try {
      const endpoint = tipo === 'natural' ? '/clientes/persona-natural' : '/clientes/persona-juridica';
      const payload = {
        ...form,
        rut:          form.rut          ? Number(form.rut)          : undefined,
        repLegalRut:  form.repLegalRut  ? Number(form.repLegalRut)  : undefined,
        rentaMensual: form.rentaMensual ? Number(form.rentaMensual) : undefined,
      };
      await api.post(endpoint, payload);
      setSuccess('Cliente creado exitosamente');
      setShowForm(false);
      setForm({});
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 className="page-title">Clientes</h1>
            <p className="page-subtitle">Personas naturales y jurídicas</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(''); }} className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo cliente
          </button>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Form */}
        {showForm && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Nuevo cliente</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Tipo tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
              {(['natural', 'juridica'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    background: tipo === t ? 'white' : 'transparent',
                    color: tipo === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    boxShadow: tipo === t ? '0 1px 3px hsl(222 47% 11% / 0.1)' : 'none',
                  }}
                >
                  {t === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">RUT</label>
                  <input type="number" placeholder="12345678" onChange={e => setForm({ ...form, rut: e.target.value })} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">DV</label>
                  <input type="text" maxLength={1} placeholder="9" onChange={e => setForm({ ...form, dv: e.target.value })} className="form-input" required />
                </div>

                {tipo === 'natural' ? (
                  <>
                    <div>
                      <label className="form-label">Nombre</label>
                      <input type="text" onChange={e => setForm({ ...form, nombre: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Apellido Paterno</label>
                      <input type="text" onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input type="email" onChange={e => setForm({ ...form, email: e.target.value })} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Teléfono</label>
                      <input type="text" onChange={e => setForm({ ...form, telefono: e.target.value })} className="form-input" />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Razón Social</label>
                      <input type="text" onChange={e => setForm({ ...form, razonSocial: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">RUT Rep. Legal</label>
                      <input type="number" onChange={e => setForm({ ...form, repLegalRut: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">DV Rep. Legal</label>
                      <input type="text" maxLength={1} onChange={e => setForm({ ...form, repLegalDv: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Nombre Rep. Legal</label>
                      <input type="text" onChange={e => setForm({ ...form, repLegalNombre: e.target.value })} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Apellido Paterno Rep.</label>
                      <input type="text" onChange={e => setForm({ ...form, repLegalApellidoPaterno: e.target.value })} className="form-input" required />
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Guardar cliente</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px', maxWidth: '480px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Teléfono</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id || i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.rut}-{r.dv}</td>
                    <td style={{ fontWeight: 500 }}>{r.nombre}</td>
                    <td>
                      <span className={`badge ${r.tipoCliente?.descripcion === 'Persona Natural' ? 'badge-blue' : 'badge-purple'}`}>
                        {r.tipoCliente?.descripcion || (r.tipoClienteId === 1 ? 'Persona Natural' : 'Persona Jurídica')}
                      </span>
                    </td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.fonoContacto || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={`/clientes/${r.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style={{ fontSize: '14px' }}>Busque clientes por nombre o cree uno nuevo</p>
          </div>
        )}
      </main>
    </div>
  );
}
