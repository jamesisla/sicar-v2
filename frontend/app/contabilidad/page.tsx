'use client';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

type Tab = 'devengos' | 'contabilizaciones' | 'registrar';

interface Movimiento {
  id: number;
  fchMovimiento: string;
  fchContable: string;
  montoMov: number;
  cargoAbono: number;
  centralizadoSigfe: number;
  anioAsiento: number;
  idAsientoSigfe: number;
  tipoMovimiento?: { nombre: string; cuentaCargo: string; cuentaAbono: string };
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{value ?? '—'}</p>
    </div>
  );
}

// ─── Tab Devengos ─────────────────────────────────────────────────────────────
function DevengosTab() {
  const [rows, setRows] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ fechaDesde: '', fechaHasta: '' });
  const [error, setError] = useState('');

  const buscar = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
      const data = await api.get<Movimiento[]>(`/contabilidad/devengos?${params}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { buscar(); }, []);

  const totalAbonos = rows.filter(r => r.cargoAbono === 2).reduce((s, r) => s + Number(r.montoMov), 0);
  const totalCargos = rows.filter(r => r.cargoAbono === 1).reduce((s, r) => s + Number(r.montoMov), 0);
  const pendientes  = rows.filter(r => !r.centralizadoSigfe).length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', maxWidth: '600px' }}>
        {[
          { label: 'Movimientos',        value: rows.length,                                          color: 'hsl(var(--foreground))' },
          { label: 'Pendientes SIGFE',   value: pendientes,                                           color: pendientes > 0 ? 'hsl(38 92% 35%)' : 'hsl(var(--muted-foreground))' },
          { label: 'Total abonos',       value: `$${totalAbonos.toLocaleString('es-CL')}`,            color: 'hsl(142 71% 32%)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <form onSubmit={buscar} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Desde (DD/MM/YYYY)</label>
          <input type="text" value={filters.fechaDesde} onChange={e => setFilters(p => ({ ...p, fechaDesde: e.target.value }))}
            placeholder="01/01/2026" className="form-input" style={{ width: '150px' }} />
        </div>
        <div>
          <label className="form-label">Hasta (DD/MM/YYYY)</label>
          <input type="text" value={filters.fechaHasta} onChange={e => setFilters(p => ({ ...p, fechaHasta: e.target.value }))}
            placeholder="31/12/2026" className="form-input" style={{ width: '150px' }} />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Buscando...' : 'Filtrar'}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {rows.length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
            <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{rows.length} movimientos</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha mov.</th>
                <th>Fecha contable</th>
                <th>Tipo</th>
                <th>Cta. cargo</th>
                <th>Cta. abono</th>
                <th>Cargo/Abono</th>
                <th>Monto</th>
                <th>SIGFE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '12px' }}>{r.fchMovimiento ? new Date(r.fchMovimiento).toLocaleDateString('es-CL') : '—'}</td>
                  <td style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{r.fchContable ? new Date(r.fchContable).toLocaleDateString('es-CL') : '—'}</td>
                  <td style={{ fontSize: '12px' }}>{r.tipoMovimiento?.nombre || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{r.tipoMovimiento?.cuentaCargo || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{r.tipoMovimiento?.cuentaAbono || '—'}</td>
                  <td>
                    <span className={`badge ${r.cargoAbono === 2 ? 'badge-green' : 'badge-red'}`}>
                      {r.cargoAbono === 2 ? 'Abono' : 'Cargo'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>${Number(r.montoMov).toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`badge ${r.centralizadoSigfe ? 'badge-green' : 'badge-yellow'}`}>
                      {r.centralizadoSigfe ? 'Enviado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(var(--muted-foreground))' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', opacity: 0.4 }}>
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <p style={{ fontSize: '14px' }}>Sin movimientos pendientes de contabilización</p>
        </div>
      )}
    </div>
  );
}

// ─── Tab Contabilizaciones ────────────────────────────────────────────────────
function ContabilizacionesTab() {
  const [rows, setRows] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Movimiento[]>('/contabilidad/contabilizaciones')
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Cargando...</div>;

  return rows.length > 0 ? (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
        <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{rows.length} registros</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo movimiento</th>
            <th>Cargo/Abono</th>
            <th>Monto</th>
            <th>Año asiento</th>
            <th>ID asiento SIGFE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={{ fontSize: '12px' }}>{r.fchMovimiento ? new Date(r.fchMovimiento).toLocaleDateString('es-CL') : '—'}</td>
              <td>{r.tipoMovimiento?.nombre || '—'}</td>
              <td><span className={`badge ${r.cargoAbono === 2 ? 'badge-green' : 'badge-red'}`}>{r.cargoAbono === 2 ? 'Abono' : 'Cargo'}</span></td>
              <td style={{ fontWeight: 500 }}>${Number(r.montoMov).toLocaleString('es-CL')}</td>
              <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.anioAsiento || '—'}</td>
              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.idAsientoSigfe || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(var(--muted-foreground))' }}>
      <p style={{ fontSize: '14px' }}>Sin contabilizaciones registradas</p>
    </div>
  );
}

// ─── Tab Registrar ────────────────────────────────────────────────────────────
function RegistrarTab() {
  const [form, setForm] = useState({ cuentaDebe: '', cuentaHaber: '', montoDebe: '', montoHaber: '', fechaContable: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Sincronizar montoHaber con montoDebe automáticamente
  const f = (k: string, v: string) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      if (k === 'montoDebe') next.montoHaber = v;
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/contabilidad/contabilizaciones', {
        cuentaDebe:    form.cuentaDebe,
        cuentaHaber:   form.cuentaHaber,
        montoDebe:     Number(form.montoDebe),
        montoHaber:    Number(form.montoHaber),
        fechaContable: form.fechaContable,
        descripcion:   form.descripcion,
      });
      setSuccess('Contabilización registrada exitosamente');
      setForm({ cuentaDebe: '', cuentaHaber: '', montoDebe: '', montoHaber: '', fechaContable: '', descripcion: '' });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: '24px', maxWidth: '560px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Registrar contabilización</h2>
      <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>
        Los montos de debe y haber deben ser iguales (partida doble).
      </p>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '16px' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Cuenta debe *</label>
            <input type="text" value={form.cuentaDebe} onChange={e => f('cuentaDebe', e.target.value)}
              placeholder="1101" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Cuenta haber *</label>
            <input type="text" value={form.cuentaHaber} onChange={e => f('cuentaHaber', e.target.value)}
              placeholder="4101" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Monto debe ($) *</label>
            <input type="number" min="1" value={form.montoDebe} onChange={e => f('montoDebe', e.target.value)}
              placeholder="0" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Monto haber ($) *</label>
            <input type="number" min="1" value={form.montoHaber} onChange={e => f('montoHaber', e.target.value)}
              placeholder="0" className="form-input" required />
            {form.montoDebe && form.montoHaber && form.montoDebe !== form.montoHaber && (
              <p style={{ fontSize: '11px', color: 'hsl(0 72% 45%)', marginTop: '4px' }}>⚠ Debe = Haber</p>
            )}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Fecha contable (DD/MM/YYYY) *</label>
            <input type="text" value={form.fechaContable} onChange={e => f('fechaContable', e.target.value)}
              placeholder="15/04/2026" className="form-input" required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Descripción</label>
            <input type="text" value={form.descripcion} onChange={e => f('descripcion', e.target.value)}
              placeholder="Descripción del asiento" className="form-input" />
          </div>
        </div>

        {/* Preview */}
        {form.cuentaDebe && form.cuentaHaber && form.montoDebe && (
          <div style={{ background: 'hsl(var(--muted) / 0.5)', borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Vista previa del asiento
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <span style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Cuenta</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Debe</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Haber</span>
              <span style={{ fontFamily: 'monospace' }}>{form.cuentaDebe}</span>
              <span style={{ color: 'hsl(0 72% 45%)', fontWeight: 500 }}>${Number(form.montoDebe || 0).toLocaleString('es-CL')}</span>
              <span>—</span>
              <span style={{ fontFamily: 'monospace' }}>{form.cuentaHaber}</span>
              <span>—</span>
              <span style={{ color: 'hsl(142 71% 32%)', fontWeight: 500 }}>${Number(form.montoHaber || 0).toLocaleString('es-CL')}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Registrando...' : 'Registrar contabilización'}
        </button>
      </form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContabilidadPage() {
  const [tab, setTab] = useState<Tab>('devengos');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'devengos',         label: 'Devengos pendientes' },
    { key: 'contabilizaciones', label: 'Contabilizaciones' },
    { key: 'registrar',        label: 'Registrar asiento' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="page-header">
          <h1 className="page-title">Contabilidad</h1>
          <p className="page-subtitle">Devengos, contabilizaciones y asientos SIGFE</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: tab === t.key ? '0 1px 3px hsl(222 47% 11% / 0.1)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'devengos'          && <DevengosTab />}
        {tab === 'contabilizaciones' && <ContabilizacionesTab />}
        {tab === 'registrar'         && <RegistrarTab />}
      </main>
    </div>
  );
}
