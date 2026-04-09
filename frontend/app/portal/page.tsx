'use client';
import { useState } from 'react';
import { validarRut } from '../../lib/validators/rut';

export default function PortalPage() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartola, setCartola] = useState<any>(null);
  const [rutError, setRutError] = useState('');

  function validateRut(value: string) {
    const parts = value.replace(/\./g, '').split('-');
    if (parts.length !== 2) { setRutError('Formato: 12345678-9'); return false; }
    const [rutNum, dv] = parts;
    if (!validarRut(parseInt(rutNum), dv)) { setRutError('Dígito verificador incorrecto'); return false; }
    setRutError('');
    return true;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateRut(rut)) return;
    setError('');
    setLoading(true);
    try {
      const rutNum = parseInt(rut.replace(/\./g, '').split('-')[0]);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: rutNum, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Credenciales incorrectas');
        return;
      }
      const data = await res.json();
      document.cookie = `portal_token=${data.accessToken}; path=/portal; max-age=${data.expiresIn}`;
      setCartola({ nombre: data.nombre, token: data.accessToken });
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (cartola) {
    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h1 className="text-lg font-semibold">Portal de Arriendos</h1>
            <p className="text-sm text-muted-foreground">Ministerio de Bienes Nacionales</p>
            <p className="text-sm mt-2">Bienvenido, <strong>{cartola.nombre}</strong></p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-base font-medium mb-4">Mi Cartola</h2>
            <p className="text-sm text-muted-foreground">
              Aquí podrá consultar el estado de su contrato, emitir cupones de pago y pagar en línea.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Ver cartola
              </button>
              <button className="rounded-md bg-muted px-4 py-2 text-sm hover:bg-muted/80">
                Emitir cupón
              </button>
              <button className="rounded-md bg-muted px-4 py-2 text-sm hover:bg-muted/80">
                Pagar en línea (TGR)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm bg-card rounded-lg border p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold">Portal de Arriendos</h1>
          <p className="text-sm text-muted-foreground mt-1">Ministerio de Bienes Nacionales</p>
          <p className="text-xs text-muted-foreground mt-2">Ingrese con su RUT para consultar su contrato</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">RUT</label>
            <input type="text" value={rut} onChange={e => { setRut(e.target.value); validateRut(e.target.value); }}
              placeholder="12345678-9" required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            {rutError && <p className="text-xs text-destructive mt-1">{rutError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
