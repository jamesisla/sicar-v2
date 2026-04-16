'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/layout/sidebar';
import { api } from '../../../lib/api';

interface Detalle {
  producto: {
    id: number; montoTotal: number; numeroCuotas: number;
    fchInicio: string; fchTermino: string; regionId: number;
    estadoProducto: { id: number; nombre: string };
    tipoProducto: { nombre: string };
    cliente: { id: number; nombre: string; rut: number; dv: string };
    inmueble: { id: number; nombreCalle: string; numeroCalle: string; rolSii: string; superficieConstruida: number; superficieTotal: number; avaluoFiscal: number; tasacionComercial: number; region: { nombre: string }; comuna: { nombre: string } };
  };
  contrato: { fchPrimeraCuota: string; fchFirma: string; canonArriendo: number; numeroExpediente: string; interesPerial: number; interes: number } | null;
  cuotas: { id: number; fchVencimiento: string; monto: number; abonoPago: number; fchPago: string | null; estadoCuota: { id: number; nombre: string } }[];
  fiscalizaciones: { id: number; fchFiscalizacion: string; nombreFiscalizador: string; apellidoPaterno: string; observacion: string }[];
  resoluciones: { id: number; fchResolucion: string; causaTermino: string; resolucion: { numeroResolucion: string; anioResolucion: number; fchResolucion: string } }[];
}

const estadoBadge: Record<string, string> = {
  'Activo': 'badge-green', 'Moroso': 'badge-red', 'En CDE': 'badge-purple',
  'Terminado': 'badge-gray', 'Suspendido': 'badge-yellow', 'En Proceso': 'badge-blue',
};
const estadoCuotaBadge: Record<string, string> = {
  'Pagada': 'badge-green', 'Vigente': 'badge-blue', 'Vencida': 'badge-red',
  'En Convenio': 'badge-yellow', 'Futura': 'badge-gray', 'Pendiente': 'badge-gray',
};
const ESTADOS = [
  { id: 1, nombre: 'Activo' }, { id: 2, nombre: 'En Proceso' },
  { id: 3, nombre: 'Terminado' }, { id: 4, nombre: 'Suspendido' },
  { id: 5, nombre: 'Moroso' }, { id: 6, nombre: 'En CDE' },
];
const TIPOS_MOV = [
  { id: 1, nombre: 'Pago Banco Estado' }, { id: 2, nombre: 'Pago TGR' },
  { id: 3, nombre: 'Pago Manual' }, { id: 6, nombre: 'Ajuste' },
];

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{value ?? '—'}</p>
    </div>
  );
}

type Tab = 'cuotas' | 'fiscalizaciones' | 'resoluciones' | 'pagos';

export default function ContratoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<Tab>('cuotas');
  const [saving, setSaving] = useState('');

  // Cambiar estado
  const [showEstado, setShowEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');

  // Pago manual
  const [pagoForm, setPagoForm] = useState({ monto: '', fechaPago: '', tipoMovimientoId: '3', glosa: '' });

  // Fiscalización
  const [fiscForm, setFiscForm] = useState({ tipoFiscalizacionId: '1', fechaFiscalizacion: '', nombreFiscalizador: '', apellidoPaterno: '', observacion: '' });

  // Resolución
  const [resolForm, setResolForm] = useState({ tipoResolucionId: '1', numeroResolucion: '', anioResolucion: String(new Date().getFullYear()), fechaResolucion: '', causaTermino: '' });

  const reload = () => {
    setLoading(true);
    api.get<Detalle>(`/contratos/${id}`)
      .then(setDetalle)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  async function handleCambiarEstado(e: React.FormEvent) {
    e.preventDefault(); setSaving('estado'); setError(''); setSuccess('');
    try {
      await api.put(`/contratos/${id}/estado`, { estadoProductoId: Number(nuevoEstado) });
      setSuccess('Estado actualizado'); setShowEstado(false); reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(''); }
  }

  async function handlePagoManual(e: React.FormEvent) {
    e.preventDefault(); setSaving('pago'); setError(''); setSuccess('');
    try {
      await api.post(`/contratos/${id}/pagos`, {
        monto: Number(pagoForm.monto),
        fechaPago: pagoForm.fechaPago,
        tipoMovimientoId: Number(pagoForm.tipoMovimientoId),
        glosa: pagoForm.glosa,
      });
      setSuccess('Pago registrado en cuenta corriente');
      setPagoForm({ monto: '', fechaPago: '', tipoMovimientoId: '3', glosa: '' });
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(''); }
  }

  async function handleFiscalizacion(e: React.FormEvent) {
    e.preventDefault(); setSaving('fisc'); setError(''); setSuccess('');
    try {
      await api.post(`/contratos/${id}/fiscalizaciones`, {
        ...fiscForm, tipoFiscalizacionId: Number(fiscForm.tipoFiscalizacionId),
      });
      setSuccess('Fiscalización registrada');
      setFiscForm({ tipoFiscalizacionId: '1', fechaFiscalizacion: '', nombreFiscalizador: '', apellidoPaterno: '', observacion: '' });
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(''); }
  }

  async function handleResolucion(e: React.FormEvent) {
    e.preventDefault(); setSaving('resol'); setError(''); setSuccess('');
    try {
      await api.post(`/contratos/${id}/resoluciones`, {
        ...resolForm,
        tipoResolucionId: Number(resolForm.tipoResolucionId),
        anioResolucion: Number(resolForm.anioResolucion),
      });
      setSuccess('Resolución agregada');
      setResolForm({ tipoResolucionId: '1', numeroResolucion: '', anioResolucion: String(new Date().getFullYear()), fechaResolucion: '', causaTermino: '' });
      reload();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(''); }
  }

  const cuotasPagadas  = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Pagada').length ?? 0;
  const cuotasVencidas = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Vencida').length ?? 0;
  const cuotasVigentes = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Vigente').length ?? 0;
  const totalPagado    = detalle?.cuotas.reduce((s, c) => s + Number(c.abonoPago), 0) ?? 0;
  const totalDeuda     = detalle?.cuotas.filter(c => c.estadoCuota?.nombre === 'Vencida').reduce((s, c) => s + Number(c.monto) - Number(c.abonoPago), 0) ?? 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: '20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver
        </button>

        {loading && <div style={{ padding: '48px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Cargando...</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: '16px', maxWidth: '700px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '16px', maxWidth: '700px' }}>{success}</div>}

        {detalle && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0, background: 'hsl(221 83% 53% / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(221 83% 45%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{detalle.contrato?.numeroExpediente || `Contrato #${id}`}</h1>
                    <span className={`badge ${estadoBadge[detalle.producto.estadoProducto?.nombre] || 'badge-gray'}`}>{detalle.producto.estadoProducto?.nombre}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                    {detalle.producto.tipoProducto?.nombre} · <a href={`/clientes/${detalle.producto.cliente?.id}`} style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>{detalle.producto.cliente?.nombre}</a>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => { setShowEstado(!showEstado); setError(''); }} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Cambiar estado
                </button>
              </div>
            </div>

            {/* Cambiar estado inline */}
            {showEstado && (
              <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', maxWidth: '400px', border: '2px solid hsl(221 83% 53% / 0.3)' }}>
                <form onSubmit={handleCambiarEstado} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Nuevo estado</label>
                    <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)} className="form-input" required>
                      <option value="">Seleccione...</option>
                      {ESTADOS.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={saving === 'estado'} className="btn btn-primary btn-sm">{saving === 'estado' ? '...' : 'Guardar'}</button>
                  <button type="button" onClick={() => setShowEstado(false)} className="btn btn-secondary btn-sm">Cancelar</button>
                </form>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Total cuotas',  value: detalle.cuotas.length,                                  color: 'hsl(var(--foreground))' },
                { label: 'Pagadas',       value: cuotasPagadas,                                           color: 'hsl(142 71% 32%)' },
                { label: 'Vigentes',      value: cuotasVigentes,                                          color: 'hsl(221 83% 45%)' },
                { label: 'Vencidas',      value: cuotasVencidas,                                          color: cuotasVencidas > 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--muted-foreground))' },
                { label: 'Total pagado',  value: `$${totalPagado.toLocaleString('es-CL')}`,               color: 'hsl(142 71% 32%)' },
                { label: 'Deuda vencida', value: `$${totalDeuda.toLocaleString('es-CL')}`,                color: totalDeuda > 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--muted-foreground))' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Contrato</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Expediente"    value={detalle.contrato?.numeroExpediente} />
                  <Field label="Fecha firma"   value={detalle.contrato?.fchFirma ? new Date(detalle.contrato.fchFirma).toLocaleDateString('es-CL') : null} />
                  <Field label="Primera cuota" value={detalle.contrato?.fchPrimeraCuota ? new Date(detalle.contrato.fchPrimeraCuota).toLocaleDateString('es-CL') : null} />
                  <Field label="N° cuotas"     value={detalle.producto.numeroCuotas} />
                  <Field label="Canon mensual" value={detalle.contrato?.canonArriendo ? `$${Number(detalle.contrato.canonArriendo).toLocaleString('es-CL')}` : null} />
                </div>
              </div>
              <div className="card" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Cliente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Nombre" value={detalle.producto.cliente?.nombre} />
                  <Field label="RUT"    value={`${detalle.producto.cliente?.rut}-${detalle.producto.cliente?.dv}`} />
                  <div style={{ paddingTop: '4px' }}>
                    <a href={`/clientes/${detalle.producto.cliente?.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', fontSize: '12px' }}>Ver cliente →</a>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Inmueble</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Dirección" value={`${detalle.producto.inmueble?.nombreCalle} ${detalle.producto.inmueble?.numeroCalle}`} />
                  <Field label="Comuna"    value={detalle.producto.inmueble?.comuna?.nombre} />
                  <Field label="Región"    value={detalle.producto.inmueble?.region?.nombre} />
                  <Field label="Rol SII"   value={detalle.producto.inmueble?.rolSii} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
              {([
                { key: 'cuotas',          label: `Cuotas (${detalle.cuotas.length})` },
                { key: 'pagos',           label: 'Registrar pago' },
                { key: 'fiscalizaciones', label: `Fiscalizaciones (${detalle.fiscalizaciones.length})` },
                { key: 'resoluciones',    label: `Resoluciones (${detalle.resoluciones.length})` },
              ] as { key: Tab; label: string }[]).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                  background: tab === t.key ? 'white' : 'transparent',
                  color: tab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: tab === t.key ? '0 1px 3px hsl(222 47% 11% / 0.1)' : 'none',
                }}>{t.label}</button>
              ))}
            </div>

            {/* Tab: Cuotas */}
            {tab === 'cuotas' && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>#</th><th>Vencimiento</th><th>Monto</th><th>Abono</th><th>Saldo</th><th>Estado</th><th>Fecha pago</th></tr></thead>
                  <tbody>
                    {detalle.cuotas.map((c, i) => {
                      const saldo = Number(c.monto) - Number(c.abonoPago);
                      return (
                        <tr key={c.id}>
                          <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{i + 1}</td>
                          <td>{new Date(c.fchVencimiento).toLocaleDateString('es-CL')}</td>
                          <td style={{ fontWeight: 500 }}>${Number(c.monto).toLocaleString('es-CL')}</td>
                          <td style={{ color: 'hsl(142 71% 32%)' }}>{Number(c.abonoPago) > 0 ? `$${Number(c.abonoPago).toLocaleString('es-CL')}` : '—'}</td>
                          <td style={{ fontWeight: saldo > 0 ? 600 : 400, color: saldo > 0 ? 'hsl(0 72% 45%)' : 'hsl(var(--muted-foreground))' }}>{saldo > 0 ? `$${saldo.toLocaleString('es-CL')}` : '$0'}</td>
                          <td><span className={`badge ${estadoCuotaBadge[c.estadoCuota?.nombre] || 'badge-gray'}`}>{c.estadoCuota?.nombre}</span></td>
                          <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{c.fchPago ? new Date(c.fchPago).toLocaleDateString('es-CL') : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Pago manual */}
            {tab === 'pagos' && (
              <div className="card" style={{ padding: '24px', maxWidth: '480px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Registrar pago manual</h3>
                <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '18px' }}>El pago se registrará en la cuenta corriente del contrato.</p>
                <form onSubmit={handlePagoManual} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Monto ($) *</label>
                      <input type="number" min="1" value={pagoForm.monto} onChange={e => setPagoForm(p => ({ ...p, monto: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Fecha pago (DD/MM/YYYY) *</label>
                      <input type="text" value={pagoForm.fechaPago} onChange={e => setPagoForm(p => ({ ...p, fechaPago: e.target.value }))} placeholder="15/04/2026" className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Tipo movimiento *</label>
                      <select value={pagoForm.tipoMovimientoId} onChange={e => setPagoForm(p => ({ ...p, tipoMovimientoId: e.target.value }))} className="form-input">
                        {TIPOS_MOV.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Glosa</label>
                      <input type="text" value={pagoForm.glosa} onChange={e => setPagoForm(p => ({ ...p, glosa: e.target.value }))} className="form-input" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving === 'pago'} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {saving === 'pago' ? 'Registrando...' : 'Registrar pago'}
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Fiscalizaciones */}
            {tab === 'fiscalizaciones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', maxWidth: '560px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Nueva fiscalización</h3>
                  <form onSubmit={handleFiscalizacion} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Fecha (DD/MM/YYYY) *</label>
                      <input type="text" value={fiscForm.fechaFiscalizacion} onChange={e => setFiscForm(p => ({ ...p, fechaFiscalizacion: e.target.value }))} placeholder="15/04/2026" className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Nombre fiscalizador *</label>
                      <input type="text" value={fiscForm.nombreFiscalizador} onChange={e => setFiscForm(p => ({ ...p, nombreFiscalizador: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Apellido paterno</label>
                      <input type="text" value={fiscForm.apellidoPaterno} onChange={e => setFiscForm(p => ({ ...p, apellidoPaterno: e.target.value }))} className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Observación</label>
                      <input type="text" value={fiscForm.observacion} onChange={e => setFiscForm(p => ({ ...p, observacion: e.target.value }))} className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={saving === 'fisc'} className="btn btn-primary">{saving === 'fisc' ? 'Guardando...' : 'Agregar fiscalización'}</button>
                    </div>
                  </form>
                </div>
                {detalle.fiscalizaciones.length > 0 && (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                      <thead><tr><th>Fecha</th><th>Fiscalizador</th><th>Observación</th></tr></thead>
                      <tbody>
                        {detalle.fiscalizaciones.map(f => (
                          <tr key={f.id}>
                            <td>{f.fchFiscalizacion ? new Date(f.fchFiscalizacion).toLocaleDateString('es-CL') : '—'}</td>
                            <td style={{ fontWeight: 500 }}>{f.nombreFiscalizador} {f.apellidoPaterno}</td>
                            <td style={{ color: 'hsl(var(--muted-foreground))' }}>{f.observacion || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Resoluciones */}
            {tab === 'resoluciones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', maxWidth: '560px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Nueva resolución</h3>
                  <form onSubmit={handleResolucion} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">N° Resolución *</label>
                      <input type="text" value={resolForm.numeroResolucion} onChange={e => setResolForm(p => ({ ...p, numeroResolucion: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      
                      <label className="form-label">Año *</label>
                      <input type="number" value={resolForm.anioResolucion} onChange={e => setResolForm(p => ({ ...p, anioResolucion: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Fecha resolución (DD/MM/YYYY)</label>
                      <input type="text" value={resolForm.fechaResolucion} onChange={e => setResolForm(p => ({ ...p, fechaResolucion: e.target.value }))} placeholder="15/04/2026" className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Causal término</label>
                      <input type="text" value={resolForm.causaTermino} onChange={e => setResolForm(p => ({ ...p, causaTermino: e.target.value }))} className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={saving === 'resol'} className="btn btn-primary">{saving === 'resol' ? 'Guardando...' : 'Agregar resolución'}</button>
                    </div>
                  </form>
                </div>
                {detalle.resoluciones.length > 0 && (
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                      <thead><tr><th>N° Resolución</th><th>Año</th><th>Fecha</th><th>Causal término</th></tr></thead>
                      <tbody>
                        {detalle.resoluciones.map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 500 }}>{r.resolucion?.numeroResolucion || '—'}</td>
                            <td>{r.resolucion?.anioResolucion || '—'}</td>
                            <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.resolucion?.fchResolucion ? new Date(r.resolucion.fchResolucion).toLocaleDateString('es-CL') : '—'}</td>
                            <td style={{ color: 'hsl(var(--muted-foreground))' }}>{r.causaTermino || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
