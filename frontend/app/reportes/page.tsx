'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

const reporteTypes = [
  { value: 'cartera-morosa', label: 'Cartera Morosa por Región' },
  { value: 'convenios', label: 'Cumplimiento de Convenios' },
  { value: 'abonos', label: 'Abonos por Período' },
  { value: 'contabilizaciones', label: 'Contabilizaciones por Período' },
];

export default function ReportesPage() {
  const [tipo, setTipo] = useState('cartera-morosa');
  const [fechaDesde, setFechaDesde] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.set('fechaDesde', fechaDesde);
      const data = await api.get<{ rows: any[] }>(`/reportes/${tipo}?${params}`);
      setResults(data.rows || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const columns = results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-1">Reportes</h1>
        <p className="text-sm text-muted-foreground mb-6">Generación de reportes de gestión</p>

        <form onSubmit={handleGenerar} className="flex gap-3 mb-6 flex-wrap">
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm">
            {reporteTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input type="text" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            placeholder="Desde (DD/MM/YYYY)"
            className="rounded-md border bg-background px-3 py-2 text-sm w-44" />
          <button type="submit" disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Generando...' : 'Generar reporte'}
          </button>
        </form>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2 mb-4">{error}</p>}

        {results.length > 0 && (
          <div className="bg-card border rounded-lg overflow-auto">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium">{results.length} registros</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="text-left px-3 py-2 font-medium whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 100).map((row, i) => (
                  <tr key={i} className="border-t hover:bg-muted/30">
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                      </td>
                    ))}
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
