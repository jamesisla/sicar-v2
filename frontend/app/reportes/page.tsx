'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

// ─── Config de reportes ───────────────────────────────────────────────────────
const REPORTES = [
  {
    value: 'cartera-morosa',
    label: 'Cartera Morosa',
    desc: 'Contratos con estado moroso por región',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    color: 'hsl(0 72% 45%)',
    bg: 'hsl(0 84% 60% / 0.08)',
    hasFecha: false,
    columns: [
      { key: 'id',                          label: 'ID' },
      { key: 'cliente.nombre',              label: 'Cliente' },
      { key: 'cliente.rut',                 label: 'RUT',       mono: true },
      { key: 'montoTotal',                  label: 'Monto',     money: true },
      { key: 'regionId',                    label: 'Región' },
      { key: 'estadoProducto.nombre',       label: 'Estado' },
    ],
  },
  {
    value: 'convenios',
    label: 'Convenios de Pago',
    desc: 'Cuotas en convenio activo',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    color: 'hsl(221 83% 45%)',
    bg: 'hsl(221 83% 53% / 0.08)',
    hasFecha: false,
    columns: [
      { key: 'id',                          label: 'ID cuota' },
      { key: 'producto.cliente.nombre',     label: 'Cliente' },
      { key: 'fchVencimiento',              label: 'Vencimiento', date: true },
      { key: 'monto',                       label: 'Monto',       money: true },
      { key: 'cargoConvenio',               label: 'Cargo conv.', money: true },
      { key: 'estadoCuota.nombre',          label: 'Estado' },
    ],
  },
  {
    value: 'abonos',
    label: 'Abonos por Período',
    desc: 'Pagos recibidos en el período seleccionado',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    color: 'hsl(142 71% 32%)',
    bg: 'hsl(142 71% 45% / 0.08)',
    hasFecha: true,
    columns: [
      { key: 'id',                          label: 'ID' },
      { key: 'fchMovimiento',               label: 'Fecha',       date: true },
      { key: 'tipoMovimiento.nombre',       label: 'Tipo' },
      { key: 'montoMov',                    label: 'Monto',       money: true },
      { key: 'productoId',                  label: 'Contrato ID' },
    ],
  },
] as const;

type ReporteValue = typeof REPORTES[number]['value'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function formatValue(val: any, col: { money?: boolean; date?: boolean; mono?: boolean }): string {
  if (val === null || val === undefined) return '—';
  if (col.money) return `$${Number(val).toLocaleString('es-CL')}`;
  if (col.date)  return new Date(val).toLocaleDateString('es-CL');
  return String(val);
}

function exportCSV(rows: any[], columns: readonly { key: string; label: string; money?: boolean; date?: boolean }[], filename: string) {
  const header = columns.map(c => c.label).join(',');
  const body   = rows.map(r =>
    columns.map(c => {
      const v = formatValue(getNestedValue(r, c.key), c);
      return `"${v.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [tipo, setTipo]           = useState<ReporteValue>('cartera-morosa');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [rows, setRows]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [generated, setGenerated] = useState(false);

  const config = REPORTES.find(r => r.value === tipo)!;

  async function handleGenerar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setRows([]); setGenerated(false);
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      if (fechaHasta) params.set('fechaHasta', fechaHasta);
      const data = await api.get<any[]>(`/reportes/${tipo}?${params}`);
      setRows(Array.isArray(data) ? data : []);
      setGenerated(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const totalMonto = rows.reduce((s, r) => {
    const v = getNestedValue(r, 'montoTotal') ?? getNestedValue(r, 'montoMov') ?? getNestedValue(r, 'monto');
    return s + (Number(v) || 0);
  }, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="page-header">
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Generación de reportes de gestión y exportación</p>
        </div>

        {/* Selector de tipo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px', maxWidth: '800px' }}>
          {REPORTES.map(r => (
            <button
              key={r.value}
              onClick={() => { setTipo(r.value); setRows([]); setGenerated(false); setError(''); }}
              style={{
                padding: '14px 16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                border: `2px solid ${tipo === r.value ? r.color : 'hsl(var(--border))'}`,
                background: tipo === r.value ? r.bg : 'hsl(var(--card))',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ color: r.color, marginBottom: '8px' }}>{r.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '2px' }}>{r.label}</p>
              <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{r.desc}</p>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <form onSubmit={handleGenerar} style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {config.hasFecha && (
            <>
              <div>
                <label className="form-label">Desde (DD/MM/YYYY)</label>
                <input type="text" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                  placeholder="01/01/2026" className="form-input" style={{ width: '150px' }} />
              </div>
              <div>
                <label className="form-label">Hasta (DD/MM/YYYY)</label>
                <input type="text" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                  placeholder="30/04/2026" className="form-input" style={{ width: '150px' }} />
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Generar reporte
              </>
            )}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginBottom: '16px', maxWidth: '640px' }}>{error}</div>}

        {/* Resultados */}
        {generated && (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{rows.length}</p>
                  <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>registros</p>
                </div>
              </div>
              {totalMonto > 0 && (
                <div className="card" style={{ padding: '12px 18px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: config.color }}>
                    ${totalMonto.toLocaleString('es-CL')}
                  </p>
                  <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>monto total</p>
                </div>
              )}
            </div>

            {rows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(var(--muted-foreground))' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.4 }}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style={{ fontSize: '14px' }}>Sin resultados para los filtros seleccionados</p>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{config.label}</span>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>· {rows.length} registros</span>
                  </div>
                  <button
                    onClick={() => exportCSV(rows, config.columns, `${config.value}-${new Date().toISOString().slice(0,10)}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Exportar CSV
                  </button>
                </div>

                {/* Tabla */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {config.columns.map(c => <th key={c.key}>{c.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 200).map((row, i) => (
                        <tr key={i}>
                          {config.columns.map(col => {
                            const val = getNestedValue(row, col.key);
                            const fmt = formatValue(val, col);
                            return (
                              <td key={col.key} style={{
                                fontFamily: (col as any).mono ? 'monospace' : undefined,
                                fontSize:   (col as any).mono ? '12px' : undefined,
                                fontWeight: (col as any).money && Number(val) > 0 ? 500 : undefined,
                                color:      (col as any).money && Number(val) > 0 ? config.color : undefined,
                                whiteSpace: 'nowrap',
                              }}>
                                {fmt}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 200 && (
                    <div style={{ padding: '10px 16px', fontSize: '12px', color: 'hsl(var(--muted-foreground))', borderTop: '1px solid hsl(var(--border))' }}>
                      Mostrando 200 de {rows.length} registros. Exporta el CSV para ver todos.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
