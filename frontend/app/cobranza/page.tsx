'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { validarRut } from '../../lib/validators/rut';
import { api } from '../../lib/api';

interface DeudaResult {
  IDPRODUCTO: number;
  CANUMEROEXPEDIENTE: string;
  CLNOMBRE: string;
  CLRUT: number;
  CLDV: string;
  INNOMBRECALLE: string;
  PRREGION: number;
  ESTADO: string;
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
    if (!validarRut(parseInt(rutNum), dv)) {
      setRutError('Dígito verificador incorrecto');
      return false;
    }
    setRutError('');
    return true;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!rut && !nombre && !expediente) {
      setError('Ingrese al menos un criterio de búsqueda');
      return;
    }
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-1">Buscador de Deuda</h1>
        <p className="text-sm text-muted-foreground mb-6">Busque contratos morosos por múltiples criterios</p>

        <form onSubmit={handleSearch} className="bg-card border rounded-lg p-6 mb-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de contrato</label>
              <select
                value={tipoProducto}
                onChange={e => setTipoProducto(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="1">Arriendo</option>
                <option value="2">Venta</option>
                <option value="3">Concesión</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RUT</label>
              <input
                type="text"
                value={rut}
                onChange={e => { setRut(e.target.value); validateRut(e.target.value); }}
                placeholder="12345678-9"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              {rutError && <p className="text-xs text-destructive mt-1">{rutError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre del arrendatario"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° Expediente</label>
              <input
                type="text"
                value={expediente}
                onChange={e => setExpediente(e.target.value)}
                placeholder="Número de expediente"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Expediente</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">RUT</th>
                  <th className="text-left px-4 py-3 font-medium">Inmueble</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.IDPRODUCTO} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.CANUMEROEXPEDIENTE}</td>
                    <td className="px-4 py-3">{r.CLNOMBRE}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.CLRUT}-{r.CLDV}</td>
                    <td className="px-4 py-3 text-xs">{r.INNOMBRECALLE}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        {r.ESTADO}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/cobranza/${r.IDPRODUCTO}`} className="text-xs text-primary hover:underline">
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
