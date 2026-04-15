'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { api } from '../../lib/api';

type Tab = 'usuarios' | 'perfiles' | 'nuevo';

interface Usuario {
  id: number; login: string; nombre: string; apellidoPaterno: string;
  apellidoMaterno: string; rut: number; dv: string; correo: string;
  estado: number; regionId: number;
  perfil: { id: number; nombre: string };
}

interface Perfil { id: number; nombre: string; }

const PERFIL_BADGE: Record<string, string> = {
  'Administrador':    'badge-red',
  'Operador Nacional':'badge-blue',
  'Operador Regional':'badge-purple',
  'Supervisor':       'badge-yellow',
  'Cliente Portal':   'badge-gray',
};

const REGIONES = [
  { id: 1,  nombre: 'Tarapacá' },
  { id: 2,  nombre: 'Antofagasta' },
  { id: 3,  nombre: 'Atacama' },
  { id: 4,  nombre: 'Coquimbo' },
  { id: 5,  nombre: 'Valparaíso' },
  { id: 6,  nombre: "O'Higgins" },
  { id: 7,  nombre: 'Maule' },
  { id: 8,  nombre: 'Biobío' },
  { id: 9,  nombre: 'Araucanía' },
  { id: 10, nombre: 'Los Lagos' },
  { id: 11, nombre: 'Aysén' },
  { id: 12, nombre: 'Magallanes' },
  { id: 13, nombre: 'Metropolitana' },
  { id: 14, nombre: 'Los Ríos' },
  { id: 15, nombre: 'Arica y Parinacota' },
  { id: 16, nombre: 'Ñuble' },
  { id: 90, nombre: 'Nacional (todas)' },
];

// ─── Tab Usuarios ─────────────────────────────────────────────────────────────
function UsuariosTab({ perfiles }: { perfiles: Perfil[] }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [desactivando, setDesactivando] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get<Usuario[]>('/admin/usuarios')
      .then(setUsuarios)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function desactivar(id: number) {
    if (!confirm('¿Desactivar este usuario?')) return;
    setDesactivando(id);
    try {
      await api.put(`/admin/usuarios/${id}/desactivar`, {});
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado: 0 } : u));
      setMsg('Usuario desactivado');
    } catch (e: any) { setMsg(e.message); }
    finally { setDesactivando(null); }
  }

  const filtered = usuarios.filter(u =>
    !search ||
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.login?.toLowerCase().includes(search.toLowerCase()) ||
    u.correo?.toLowerCase().includes(search.toLowerCase())
  );

  const activos   = usuarios.filter(u => u.estado === 1).length;
  const inactivos = usuarios.filter(u => u.estado === 0).length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total usuarios', value: usuarios.length, color: 'hsl(var(--foreground))' },
          { label: 'Activos',        value: activos,         color: 'hsl(142 71% 32%)' },
          { label: 'Inactivos',      value: inactivos,       color: 'hsl(var(--muted-foreground))' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 20px' }}>
            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: '16px', maxWidth: '500px' }}>{msg}</div>}

      {/* Búsqueda */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, login o correo..." className="form-input" style={{ paddingLeft: '32px' }} />
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>Cargando...</div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Perfil</th>
                <th>Región</th>
                <th>Correo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ opacity: u.estado === 0 ? 0.5 : 1 }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{u.login}</td>
                  <td style={{ fontWeight: 500 }}>{u.nombre} {u.apellidoPaterno}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{u.rut ? `${u.rut}-${u.dv}` : '—'}</td>
                  <td>
                    <span className={`badge ${PERFIL_BADGE[u.perfil?.nombre] || 'badge-gray'}`}>
                      {u.perfil?.nombre || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {REGIONES.find(r => r.id === u.regionId)?.nombre || '—'}
                  </td>
                  <td style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{u.correo || '—'}</td>
                  <td>
                    <span className={`badge ${u.estado === 1 ? 'badge-green' : 'badge-gray'}`}>
                      {u.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.estado === 1 && u.login !== 'admin' && (
                      <button
                        onClick={() => desactivar(u.id)}
                        disabled={desactivando === u.id}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'hsl(0 72% 45%)', fontSize: '11px' }}
                      >
                        {desactivando === u.id ? '...' : 'Desactivar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '13px' }}>
              Sin resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab Perfiles ─────────────────────────────────────────────────────────────
function PerfilesTab({ perfiles }: { perfiles: Perfil[] }) {
  const PERMISOS: Record<number, string[]> = {
    1: ['Acceso total al sistema', 'Gestión de usuarios', 'Todos los módulos', 'Todas las regiones'],
    2: ['Clientes', 'Inmuebles', 'Contratos', 'Cobranza', 'Pagos', 'Reportes', 'Todas las regiones'],
    3: ['Clientes', 'Inmuebles', 'Contratos', 'Cobranza', 'Pagos', 'Reportes', 'Solo su región'],
    4: ['Clientes', 'Inmuebles', 'Contratos', 'Cobranza', 'Reportes', 'Todas las regiones'],
    99: ['Portal público de pagos', 'Solo sus contratos'],
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', maxWidth: '900px' }}>
      {perfiles.filter(p => p.id !== 99).map(p => (
        <div key={p.id} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: p.id === 1 ? 'hsl(0 84% 60% / 0.1)' : p.id === 2 ? 'hsl(221 83% 53% / 0.1)' : p.id === 3 ? 'hsl(262 83% 58% / 0.1)' : 'hsl(38 92% 50% / 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: p.id === 1 ? 'hsl(0 72% 45%)' : p.id === 2 ? 'hsl(221 83% 45%)' : p.id === 3 ? 'hsl(262 83% 45%)' : 'hsl(38 92% 35%)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {p.id === 1
                  ? <><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></>
                  : <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
                }
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>{p.nombre}</p>
              <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Perfil #{p.id}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(PERMISOS[p.id] || []).map(perm => (
              <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(142 71% 45%)', flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {perm}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab Nuevo Usuario ────────────────────────────────────────────────────────
function NuevoUsuarioTab({ perfiles, onCreated }: { perfiles: Perfil[]; onCreated: () => void }) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await api.post('/admin/usuarios', {
        ...form,
        rut:      Number(form.rut),
        perfilId: Number(form.perfilId),
        region:   Number(form.region),
      });
      setSuccess(`Usuario "${form.login}" creado exitosamente`);
      setForm({});
      onCreated();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="card" style={{ padding: '24px', maxWidth: '560px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Nuevo usuario</h2>
      <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>
        El usuario podrá ingresar al sistema con el login y contraseña asignados.
      </p>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '16px' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Datos personales</p>
          </div>
          <div>
            <label className="form-label">Nombre *</label>
            <input type="text" value={form.nombre || ''} onChange={e => f('nombre', e.target.value)} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Apellido paterno *</label>
            <input type="text" value={form.apellidoPaterno || ''} onChange={e => f('apellidoPaterno', e.target.value)} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Apellido materno</label>
            <input type="text" value={form.apellidoMaterno || ''} onChange={e => f('apellidoMaterno', e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Correo *</label>
            <input type="email" value={form.correo || ''} onChange={e => f('correo', e.target.value)} className="form-input" required />
          </div>
          <div>
            <label className="form-label">RUT *</label>
            <input type="number" value={form.rut || ''} onChange={e => f('rut', e.target.value)} placeholder="12345678" className="form-input" required />
          </div>
          <div>
            <label className="form-label">DV *</label>
            <input type="text" maxLength={1} value={form.dv || ''} onChange={e => f('dv', e.target.value)} placeholder="9" className="form-input" required />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Acceso al sistema</p>
          </div>
          <div>
            <label className="form-label">Login *</label>
            <input type="text" value={form.login || ''} onChange={e => f('login', e.target.value)} placeholder="usuario123" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Contraseña *</label>
            <input type="password" value={form.password || ''} onChange={e => f('password', e.target.value)} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Perfil *</label>
            <select value={form.perfilId || ''} onChange={e => f('perfilId', e.target.value)} className="form-input" required>
              <option value="">Seleccione perfil</option>
              {perfiles.filter(p => p.id !== 99).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Región *</label>
            <select value={form.region || ''} onChange={e => f('region', e.target.value)} className="form-input" required>
              <option value="">Seleccione región</option>
              {REGIONES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Preview */}
        {form.nombre && form.login && form.perfilId && (
          <div style={{ background: 'hsl(var(--muted) / 0.5)', borderRadius: '8px', padding: '14px 16px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(221 83% 53% / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(221 83% 45%)', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{form.nombre} {form.apellidoPaterno || ''}</p>
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                @{form.login} · {perfiles.find(p => p.id === Number(form.perfilId))?.nombre} · {REGIONES.find(r => r.id === Number(form.region))?.nombre}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
          <button type="button" onClick={() => setForm({})} className="btn btn-secondary">Limpiar</button>
        </div>
      </form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab]       = useState<Tab>('usuarios');
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.get<Perfil[]>('/admin/perfiles').then(setPerfiles).catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'usuarios', label: 'Usuarios',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      key: 'perfiles', label: 'Perfiles y permisos',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    },
    {
      key: 'nuevo', label: 'Nuevo usuario',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">Administración</h1>
            <p className="page-subtitle">Gestión de usuarios, perfiles y accesos al sistema</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
            background: 'hsl(0 84% 60% / 0.08)', border: '1px solid hsl(0 84% 60% / 0.2)',
            borderRadius: '8px', fontSize: '12px', color: 'hsl(0 72% 45%)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Solo administradores
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: tab === t.key ? '0 1px 3px hsl(222 47% 11% / 0.1)' : 'none',
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === 'usuarios' && <UsuariosTab key={reload} perfiles={perfiles} />}
        {tab === 'perfiles' && <PerfilesTab perfiles={perfiles} />}
        {tab === 'nuevo'    && <NuevoUsuarioTab perfiles={perfiles} onCreated={() => { setReload(r => r + 1); setTab('usuarios'); }} />}
      </main>
    </div>
  );
}
