'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { validarRut } from '../../lib/validators/rut';
import { api } from '../../lib/api';

interface DeudaResult {
  id: number;
  contrato?: { numeroExpediente: string };
  cliente?: { nombre: string; rut: number; dv: string };
  inmueble?: { nombreCalle: string };
  estadoProducto?: { nombre: string };
}

export default function CobranzaPage() {
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [expediente, setExpediente] = useState('');
  const [tipoProducto, setTipoProducto] = useState('1');
  const [results, setResults] = useState<DeudaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rutError, setRutError] = useState('');

  function validateRut(value: string) {
    if (!value) { setRutError(''); return true; }
    const parts = value.replace(/\./g, '').split('-');
    if (parts.length !== 2) { setRutError('Formato: 12345678-9'); return false; }
    const [rutNum, dv] = parts;
    if (!validarRut(parseInt(rutNum), dv)) { setRutError('Dígito verificador incorrecto'); return false; }
    setRutError('');
    return true;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!rut && !nombre && !expediente) { setError('Ingrese al menos un criterio de búsqueda'); return; }
    if (rut && !validateRut(rut)) return;
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams({ tipoProducto });
      if (rut) params.set('rut', rut.replace(/\./g, '').split('-')[0]);
      if (nombre) params.set('nombre', nombre);
      if (expediente) params.set('expediente', expediente);
      const data = await api.get<{ rows: DeudaResult[] }>(`/cobranza/deuda?${params}`);
      setResults(data.rows || []);
      if (!data.rows?.length) setError('No existen morosidades con los filtros seleccionados');
    } catch (err: any) {
      setError(err.message || 'Error al buscar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="page-header">
          <h1 className="page-title">Buscador de Deuda</h1>
          <p className="page-subtitle">Busque contratos morosos por múltiples criterios</p>
        </div>

        {/* Search form */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px', maxWidth: '640px' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Tipo de contrato</label>
                <select value={tipoProducto} onChange={e => setTipoProducto(e.target.value)} className="form-input">
                  <option value="1">Arriendo</option>
                  <option value="2">Venta</option>
                  <option value="3">Concesión</option>
                </select>
              </div>
              <div>
                <label className="form-label">RUT</label>
                <input
                  type="text"
                  value={rut}
                  onChange={e => { setRut(e.target.value); validateRut(e.target.value); }}
                  placeholder="12345678-9"
                  className="form-input"
                />
                {rutError && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px' }}>{rutError}</p>}
              </div>
              <div>
                <label className="form-label">Nombre</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del arrendatario" className="form-input" />
              </div>
              <div>
                <label className="form-label">N° Expediente</label>
                <input type="text" value={expediente} onChange={e => setExpediente(e.target.value)} placeholder="Número de expediente" className="form-input" />
              </div>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '14px' }}>{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Buscando...' : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Buscar deuda
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-red">{results.length}</span>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>contrato{results.length !== 1 ? 's' : ''} con deuda</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expediente</th>
                  <th>Cliente</th>
                  <th>RUT</th>
                  <th>Inmueble</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{r.contrato?.numeroExpediente || '—'}</td>
                    <td style={{ fontWeight: 500 }}>{r.cliente?.nombre}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.cliente?.rut}-{r.cliente?.dv}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.inmueble?.nombreCalle}</td>
                    <td><span className="badge badge-red">{r.estadoProducto?.nombre}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={`/cobranza/${r.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                        Ver detalle →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
