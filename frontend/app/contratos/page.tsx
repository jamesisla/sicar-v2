'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

const estadoColors: any = {
  'Activo': 'bg-green-100 text-green-700',
  'Moroso': 'bg-red-100 text-red-700',
  'En CDE': 'bg-purple-100 text-purple-700',
  'Terminado': 'bg-gray-100 text-gray-600',
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-1">Contratos</h1>
        <p className="text-sm text-muted-foreground mb-6">Gestión de contratos de arriendo, venta y concesión</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <select
            value={filters.tipo}
            onChange={e => setFilters({ ...filters, tipo: e.target.value })}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="1">Arriendo</option>
            <option value="2">Venta</option>
            <option value="3">Concesión</option>
          </select>
          <select
            value={filters.estado}
            onChange={e => setFilters({ ...filters, estado: e.target.value })}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="1">Activo</option>
            <option value="5">Moroso</option>
            <option value="6">En CDE</option>
            <option value="3">Terminado</option>
          </select>
          <button type="submit" disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Expediente</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Inmueble</th>
                  <th className="text-left px-4 py-3 font-medium">Inicio</th>
                  <th className="text-left px-4 py-3 font-medium">Monto</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.IDPRODUCTO} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.CANUMEROEXPEDIENTE}</td>
                    <td className="px-4 py-3 text-xs">{r.CLIENTE}</td>
                    <td className="px-4 py-3 text-xs">{r.INNOMBRECALLE} {r.INNUMEROCALLE}</td>
                    <td className="px-4 py-3 text-xs">{r.PRFCHINICIO ? new Date(r.PRFCHINICIO).toLocaleDateString('es-CL') : '—'}</td>
                    <td className="px-4 py-3 text-xs">${(r.PRMONTOTOTAL || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${estadoColors[r.ESTADO] || 'bg-gray-100 text-gray-600'}`}>
                        {r.ESTADO}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/contratos/${r.IDPRODUCTO}`} className="text-xs text-primary hover:underline">Ver →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {results.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">Seleccione filtros y presione Buscar para ver contratos.</p>
        )}
      </main>
    </div>
  );
}
