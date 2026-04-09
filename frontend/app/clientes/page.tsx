'use client';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { validarRut } from '../../lib/validators/rut';
import { api } from '../../lib/api';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<'natural' | 'juridica'>('natural');
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('nombre', search);
      const data = await api.get<{ rows: any[] }>(`/clientes?${params}`);
      setResults(data.rows || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validarRut(parseInt(form.rut), form.dv)) {
      setError('Dígito verificador del RUT incorrecto');
      return;
    }
    try {
      const endpoint = tipo === 'natural' ? '/clientes/persona-natural' : '/clientes/persona-juridica';
      await api.post(endpoint, form);
      setSuccess('Cliente creado exitosamente');
      setShowForm(false);
      setForm({});
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Clientes</h1>
            <p className="text-sm text-muted-foreground">Personas naturales y jurídicas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Nuevo cliente
          </button>
        </div>

        {success && <p className="text-sm text-green-700 bg-green-50 rounded px-3 py-2 mb-4">{success}</p>}
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2 mb-4">{error}</p>}

        {showForm && (
          <div className="bg-card border rounded-lg p-6 mb-6 max-w-2xl">
            <h2 className="text-base font-medium mb-4">Nuevo cliente</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTipo('natural')} className={`px-3 py-1.5 rounded text-sm ${tipo === 'natural' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Persona Natural</button>
              <button onClick={() => setTipo('juridica')} className={`px-3 py-1.5 rounded text-sm ${tipo === 'juridica' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Persona Jurídica</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">RUT</label>
                  <input type="number" placeholder="12345678" onChange={e => setForm({ ...form, rut: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">DV</label>
                  <input type="text" maxLength={1} placeholder="9" onChange={e => setForm({ ...form, dv: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                </div>
                {tipo === 'natural' ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nombre</label>
                      <input type="text" onChange={e => setForm({ ...form, nombre: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Apellido Paterno</label>
                      <input type="text" onChange={e => setForm({ ...form, apellidoPaterno: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Email</label>
                      <input type="email" onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Teléfono</label>
                      <input type="text" onChange={e => setForm({ ...form, telefono: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Razón Social</label>
                      <input type="text" onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">RUT Rep. Legal</label>
                      <input type="number" onChange={e => setForm({ ...form, repLegalRut: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">DV Rep. Legal</label>
                      <input type="text" maxLength={1} onChange={e => setForm({ ...form, repLegalDv: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Nombre Rep. Legal</label>
                      <input type="text" onChange={e => setForm({ ...form, repLegalNombre: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Apellido Paterno Rep.</label>
                      <input type="text" onChange={e => setForm({ ...form, repLegalApellidoPaterno: e.target.value })}
                        className="w-full rounded border bg-background px-3 py-1.5 text-sm" required />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded bg-muted px-4 py-1.5 text-sm hover:bg-muted/80">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button type="submit" disabled={loading} className="rounded-md bg-muted px-4 py-2 text-sm hover:bg-muted/80">
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">RUT</th>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.IDCLIENTE} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.CLRUT}-{r.CLDV}</td>
                    <td className="px-4 py-3">{r.CLNOMBRE}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.TCDESCRIPCION}</td>
                    <td className="px-4 py-3 text-xs">{r.CLFONOCONTACTO || '—'}</td>
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
