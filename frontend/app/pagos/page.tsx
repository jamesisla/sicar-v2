'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

// ─── Carga Banco ─────────────────────────────────────────────────────────────
function CargaBancoTab() {
  const [tipo, setTipo] = useState('arriendo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.post('/pagos/carga-banco', { tipo, registros: [] });
      setResult(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: '24px', maxWidth: '520px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Carga de pagos Banco Estado</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">Tipo de cartera</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="form-input">
            <option value="arriendo">Arriendo</option>
            <option value="venta">Venta</option>
            <option value="concesion">Concesión</option>
          </select>
        </div>
        <div>
          <label className="form-label">Archivo de pagos</label>
          <div style={{ border: '2px dashed hsl(var(--border))', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', color: 'hsl(var(--muted-foreground))' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Arrastra el archivo aquí o</p>
            <label style={{ fontSize: '13px', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 500 }}>
              selecciona un archivo
              <input type="file" accept=".csv,.txt" style={{ display: 'none' }} />
            </label>
            <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>CSV o TXT</p>
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {result && <div className="alert alert-success">Procesados: <strong>{result.procesados}</strong> / {result.total} — Errores: {result.errores}</div>}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Procesando...' : 'Cargar archivo'}
        </button>
      </form>
    </div>
  );
}

// ─── Generar Cupón ────────────────────────────────────────────────────────────
interface Cuota {
  id: number; fchVencimiento: string; monto: number;
  estadoCuota: { id: number; nombre: string };
}

function GenerarCuponTab() {
  const [expediente, setExpediente] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [contrato, setContrato] = useState<any>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
  const [generando, setGenerando] = useState(false);
  const [cupon, setCupon] = useState<any>(null);
  const [error, setError] = useState('');

  async function buscarContrato(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setContrato(null); setCuotas([]); setSeleccionadas(new Set()); setCupon(null);
    setBuscando(true);
    try {
      // Buscar por expediente en contratos
      const data = await api.get<{ rows: any[] }>(`/contratos?tipo=1`);
      const found = data.rows?.find((r: any) => r.contrato?.numeroExpediente === expediente.trim());
      if (!found) {
        setError('No se encontró un contrato con ese número de expediente');
        return;
      }
      // Cargar detalle con cuotas
      const detalle = await api.get<any>(`/contratos/${found.id}`);
      setContrato(detalle.producto);
      // Solo cuotas vigentes o vencidas (pendientes de pago)
      const pendientes = (detalle.cuotas as Cuota[]).filter(
        c => c.estadoCuota?.nombre === 'Vigente' || c.estadoCuota?.nombre === 'Vencida'
      );
      setCuotas(pendientes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  }

  function toggleCuota(id: number) {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodas() {
    if (seleccionadas.size === cuotas.length) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(cuotas.map(c => c.id)));
    }
  }

  const montoTotal = cuotas
    .filter(c => seleccionadas.has(c.id))
    .reduce((s, c) => s + Number(c.monto), 0);

  async function generarCupon() {
    if (seleccionadas.size === 0) { setError('Seleccione al menos una cuota'); return; }
    setError(''); setGenerando(true);
    try {
      const result = await api.post<any>('/pagos/cupones', {
        productoId: contrato.id,
        cuotaIds: Array.from(seleccionadas),
        origenCarga: 'operador',
      });
      setCupon(result);
      setSeleccionadas(new Set());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  const estadoColor: Record<string, string> = {
    'Vigente': 'badge-blue', 'Vencida': 'badge-red',
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Buscar contrato */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Buscar contrato</h2>
        <form onSubmit={buscarContrato} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <input
              type="text"
              value={expediente}
              onChange={e => setExpediente(e.target.value)}
              placeholder="Número de expediente (ej: EXP-2023-002)"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              required
            />
          </div>
          <button type="submit" disabled={buscando} className="btn btn-primary">
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Cupón generado */}
      {cupon && (
        <div className="alert alert-success" style={{ marginBottom: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Cupón generado exitosamente
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <span>Folio: <strong>{cupon.folio}</strong></span>
            <span>Monto total: <strong>${Number(cupon.montoTotal).toLocaleString('es-CL')}</strong></span>
          </div>
        </div>
      )}

      {/* Contrato encontrado */}
      {contrato && (
        <>
          <div className="card" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{contrato.cliente?.nombre}</p>
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                {contrato.inmueble?.nombreCalle} {contrato.inmueble?.numeroCalle} · {contrato.tipoProducto?.nombre}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Canon mensual</p>
              <p style={{ fontSize: '16px', fontWeight: 700 }}>${Number(contrato.montoTotal).toLocaleString('es-CL')}</p>
            </div>
          </div>

          {cuotas.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              <p style={{ fontSize: '13px' }}>No hay cuotas pendientes de pago para este contrato</p>
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {/* Header tabla */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={seleccionadas.size === cuotas.length && cuotas.length > 0}
                    onChange={toggleTodas}
                    style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {seleccionadas.size > 0 ? `${seleccionadas.size} cuota${seleccionadas.size !== 1 ? 's' : ''} seleccionada${seleccionadas.size !== 1 ? 's' : ''}` : `${cuotas.length} cuotas pendientes`}
                  </span>
                </div>
                {seleccionadas.size > 0 && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(221 83% 45%)' }}>
                    Total: ${montoTotal.toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>#</th>
                    <th>Vencimiento</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((c, i) => (
                    <tr
                      key={c.id}
                      onClick={() => toggleCuota(c.id)}
                      style={{ cursor: 'pointer', background: seleccionadas.has(c.id) ? 'hsl(221 83% 53% / 0.06)' : undefined }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={seleccionadas.has(c.id)}
                          onChange={() => toggleCuota(c.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{i + 1}</td>
                      <td>{new Date(c.fchVencimiento).toLocaleDateString('es-CL')}</td>
                      <td style={{ fontWeight: 500 }}>${Number(c.monto).toLocaleString('es-CL')}</td>
                      <td><span className={`badge ${estadoColor[c.estadoCuota?.nombre] || 'badge-gray'}`}>{c.estadoCuota?.nombre}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer con botón */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  {seleccionadas.size === 0 ? 'Seleccione las cuotas a incluir en el cupón' : `Monto a cobrar: $${montoTotal.toLocaleString('es-CL')}`}
                </span>
                <button
                  onClick={generarCupon}
                  disabled={generando || seleccionadas.size === 0}
                  className="btn btn-primary"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  {generando ? 'Generando...' : 'Generar cupón'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PagosPage() {
  const [tab, setTab] = useState<'carga' | 'cupon'>('carga');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="page-header">
          <h1 className="page-title">Pagos</h1>
          <p className="page-subtitle">Carga de pagos y generación de cupones</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
          {([
            { key: 'carga', label: 'Carga Banco Estado' },
            { key: 'cupon', label: 'Generar Cupón' },
          ] as const).map(t => (
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

        {tab === 'carga' && <CargaBancoTab />}
        {tab === 'cupon' && <GenerarCuponTab />}
      </main>
    </div>
  );
}
