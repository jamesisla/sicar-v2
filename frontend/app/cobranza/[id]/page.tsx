'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { api } from '../../../lib/api';

interface Cuota {
  id: number;
  fchVencimiento: string;
  monto: number;
  montoReavaluo: number;
  cargoInteres: number;
  abonoConvenio: number;
  abonoConvenioNum: number;
  abonoPago: number;
  fchPago: string | null;
  estadoCuota: { id: number; nombre: string };
}

interface Movimiento {
  id: number;
  fchMovimiento: string;
  montoMov: number;
  cargoAbono: number;
  tipoMovimiento: { nombre: string };
}

interface Detalle {
  cuentaCorriente: Movimiento[];
  cuotas: Cuota[];
  totalDeuda: number;
}

const estadoCuotaColor: Record<string, string> = {
  'Pagada':      'badge-green',
  'Vigente':     'badge-blue',
  'Vencida':     'badge-red',
  'En Convenio': 'badge-yellow',
  'Futura':      'badge-gray',
  'Pendiente':   'badge-gray',
  'Anulada':     'badge-gray',
};

export default function CobranzaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'cuotas' | 'movimientos'>('cuotas');
  const [accionLoading, setAccionLoading] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    api.get<Detalle>(`/cobranza/deuda/${id}`)
      .then(setDetalle)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function generarAviso() {
    setAccionLoading('aviso');
    setMensaje('');
    try {
      const res = await api.post<any>(`/cobranza/${id}/avisos`, {});
      setMensaje(`Aviso N°${res.numeroAviso} generado correctamente.${res.habilitaCDE ? ' Ya puede enviar al CDE.' : ''}`);
    } catch (e: any) {
      setMensaje(e.message);
    } finally {
      setAccionLoading('');
    }
  }

  async function enviarCDE() {
    setAccionLoading('cde');
    setMensaje('');
    try {
      await api.post(`/cobranza/${id}/cde`, {});
      setMensaje('Contrato enviado al CDE exitosamente.');
    } catch (e: any) {
      setMensaje(e.message);
    } finally {
      setAccionLoading('');
    }
  }

  const cuotasVencidas = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Vencida') ?? [];
  const cuotasPagadas = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Pagada') ?? [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'hsl(var(--muted-foreground))' }}>
            Cargando detalle...
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ maxWidth: '600px' }}>{error}</div>
        )}

        {detalle && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="page-title">Detalle de Deuda</h1>
                <p className="page-subtitle">Contrato ID #{id}</p>
              </div>

              {/* Resumen deuda */}
              <div style={{
                background: 'hsl(0 84% 60% / 0.08)',
                border: '1px solid hsl(0 84% 60% / 0.2)',
                borderRadius: '10px',
                padding: '16px 24px',
                textAlign: 'right',
              }}>
                <p style={{ fontSize: '11px', color: 'hsl(0 72% 45%)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Total deuda
                </p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: 'hsl(0 72% 45%)', letterSpacing: '-0.02em' }}>
                  ${Number(detalle.totalDeuda).toLocaleString('es-CL')}
                </p>
                <p style={{ fontSize: '12px', color: 'hsl(0 72% 55%)', marginTop: '2px' }}>
                  {cuotasVencidas.length} cuota{cuotasVencidas.length !== 1 ? 's' : ''} vencida{cuotasVencidas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Total cuotas', value: detalle.cuotas.length, color: 'hsl(var(--foreground))' },
                { label: 'Pagadas', value: cuotasPagadas.length, color: 'hsl(142 71% 32%)' },
                { label: 'Vencidas', value: cuotasVencidas.length, color: 'hsl(0 72% 45%)' },
                { label: 'Movimientos', value: detalle.cuentaCorriente.length, color: 'hsl(221 83% 45%)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '16px' }}>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, marginRight: '4px' }}>Acciones:</span>
              <button
                onClick={generarAviso}
                disabled={!!accionLoading}
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {accionLoading === 'aviso' ? 'Generando...' : 'Generar aviso'}
              </button>
              <button
                onClick={enviarCDE}
                disabled={!!accionLoading}
                className="btn btn-danger"
                style={{ fontSize: '12px' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                {accionLoading === 'cde' ? 'Enviando...' : 'Enviar al CDE'}
              </button>

              {mensaje && (
                <span style={{
                  fontSize: '12px',
                  color: mensaje.includes('exitosamente') || mensaje.includes('generado') ? 'hsl(142 71% 32%)' : 'hsl(0 72% 45%)',
                  background: mensaje.includes('exitosamente') || mensaje.includes('generado') ? 'hsl(142 71% 45% / 0.1)' : 'hsl(0 84% 60% / 0.1)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}>
                  {mensaje}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
              {(['cuotas', 'movimientos'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                    border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    boxShadow: tab === t ? '0 1px 3px hsl(222 47% 11% / 0.1)' : 'none',
                  }}
                >
                  {t === 'cuotas' ? `Cuotas (${detalle.cuotas.length})` : `Movimientos (${detalle.cuentaCorriente.length})`}
                </button>
              ))}
            </div>

            {/* Cuotas */}
            {tab === 'cuotas' && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vencimiento</th>
                      <th>Monto</th>
                      <th>Abono</th>
                      <th>Saldo</th>
                      <th>Estado</th>
                      <th>Fecha pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.cuotas.map((c, i) => {
                      const saldo = Number(c.monto) - Number(c.abonoPago);
                      return (
                        <tr key={c.id}>
                          <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{i + 1}</td>
                          <td>{new Date(c.fchVencimiento).toLocaleDateString('es-CL')}</td>
                          <td style={{ fontWeight: 500 }}>${Number(c.monto).toLocaleString('es-CL')}</td>
                          <td style={{ color: 'hsl(142 71% 32%)' }}>
                            {Number(c.abonoPago) > 0 ? `$${Number(c.abonoPago).toLocaleString('es-CL')}` : '—'}
                          </td>
                          <td style={{ fontWeight: saldo > 0 ? 600 : 400, color: saldo > 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--muted-foreground))' }}>
                            {saldo > 0 ? `$${saldo.toLocaleString('es-CL')}` : '$0'}
                          </td>
                          <td>
                            <span className={`badge ${estadoCuotaColor[c.estadoCuota?.nombre] || 'badge-gray'}`}>
                              {c.estadoCuota?.nombre}
                            </span>
                          </td>
                          <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
                            {c.fchPago ? new Date(c.fchPago).toLocaleDateString('es-CL') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Movimientos */}
            {tab === 'movimientos' && (
              <div className="card" style={{ overflow: 'hidden' }}>
                {detalle.cuentaCorriente.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '13px' }}>
                    Sin movimientos registrados
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Cargo/Abono</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.cuentaCorriente.map(m => (
                        <tr key={m.id}>
                          <td>{new Date(m.fchMovimiento).toLocaleDateString('es-CL')}</td>
                          <td>{m.tipoMovimiento?.nombre}</td>
                          <td>
                            <span className={`badge ${m.cargoAbono === 2 ? 'badge-green' : 'badge-red'}`}>
                              {m.cargoAbono === 2 ? 'Abono' : 'Cargo'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>${Number(m.montoMov).toLocaleString('es-CL')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
