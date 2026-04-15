'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

const estadoBadge: Record<string, string> = {
  'Activo': 'badge-green',
  'Moroso': 'badge-red',
  'En CDE': 'badge-purple',
  'Terminado': 'badge-gray',
};

export default function ContratosPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ estado: '', tipo: '1' });

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams(filters as any);
      const data = await api.get<{ rows: any[] }>(`/contratos?${params}`);
      setResults(data.rows || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="page-header">
          <h1 className="page-title">Contratos</h1>
          <p className="page-subtitle">Gestión de contratos de arriendo, venta y concesión</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Tipo de contrato</label>
            <select
              value={filters.tipo}
              onChange={e => setFilters({ ...filters, tipo: e.target.value })}
              className="form-input"
              style={{ width: 'auto' }}
            >
              <option value="1">Arriendo</option>
              <option value="2">Venta</option>
              <option value="3">Concesión</option>
            </select>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select
              value={filters.estado}
              onChange={e => setFilters({ ...filters, estado: e.target.value })}
              className="form-input"
              style={{ width: 'auto' }}
            >
              <option value="">Todos los estados</option>
              <option value="1">Activo</option>
              <option value="5">Moroso</option>
              <option value="6">En CDE</option>
              <option value="3">Terminado</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Cargando...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Buscar
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{results.length} contrato{results.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expediente</th>
                  <th>Cliente</th>
                  <th>Inmueble</th>
                  <th>Inicio</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{r.contrato?.numeroExpediente || '—'}</td>
                    <td style={{ fontWeight: 500 }}>{r.cliente?.nombre}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.inmueble?.nombreCalle} {r.inmueble?.numeroCalle}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {r.fchInicio ? new Date(r.fchInicio).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td style={{ fontWeight: 500 }}>${Number(r.montoTotal || 0).toLocaleString('es-CL')}</td>
                    <td>
                      <span className={`badge ${estadoBadge[r.estadoProducto?.nombre] || 'badge-gray'}`}>{r.estadoProducto?.nombre}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={`/contratos/${r.id}`} style={{ color: 'hsl(var(--primary))', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                        Ver →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(var(--muted-foreground))' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ fontSize: '14px' }}>Seleccione filtros y presione Buscar</p>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
