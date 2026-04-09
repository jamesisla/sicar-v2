'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

export default function PagosPage() {
  const [tab, setTab] = useState<'carga' | 'cupon'>('carga');
  const [tipo, setTipo] = useState('arriendo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleCargaBanco(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate file upload with sample data
    try {
      const data = await api.post('/pagos/carga-banco', {
        tipo,
        registros: [], // In production, parse the uploaded file
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-1">Pagos</h1>
        <p className="text-sm text-muted-foreground mb-6">Carga de pagos y generación de cupones</p>

        <div className="flex gap-2 mb-6">
          {(['carga', 'cupon'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
              {t === 'carga' ? 'Carga Banco Estado' : 'Generar Cupón'}
            </button>
          ))}
        </div>

        {tab === 'carga' && (
          <div className="bg-card border rounded-lg p-6 max-w-lg">
            <h2 className="text-base font-medium mb-4">Carga de pagos Banco Estado</h2>
            <form onSubmit={handleCargaBanco} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de cartera</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="arriendo">Arriendo</option>
                  <option value="venta">Venta</option>
                  <option value="concesion">Concesión</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Archivo de pagos</label>
                <input type="file" accept=".csv,.txt"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs" />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>}
              {result && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
                  Procesados: {result.procesados} / {result.total} — Errores: {result.errores}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {loading ? 'Procesando...' : 'Cargar archivo'}
              </button>
            </form>
          </div>
        )}

        {tab === 'cupon' && (
          <div className="bg-card border rounded-lg p-6 max-w-lg">
            <h2 className="text-base font-medium mb-4">Generar cupón de pago</h2>
            <p className="text-sm text-muted-foreground">
              Seleccione un contrato desde el módulo de Cobranza para generar cupones de pago.
            </p>
            <a href="/cobranza" className="inline-block mt-4 text-sm text-primary hover:underline">
              Ir a Cobranza →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
