'use client';
import { useEffect, useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';

interface AlertaCount {
  sinAceptar: number;
  porTerminar: number;
  paraCDE: number;
  cuotasVencidas: number;
  avisosPendientes: number;
  oficiosCDE: number;
  enCDESinCerrar: number;
}

const alertaConfig: {
  key: keyof AlertaCount;
  label: string;
  desc: string;
  color: string;
  accent: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'cuotasVencidas',
    label: 'Cuotas vencidas',
    desc: 'Sin aviso de cobranza',
    color: 'hsl(0 84% 60% / 0.08)',
    accent: 'hsl(0 72% 45%)',
    href: '/cobranza?alerta=cuotas-vencidas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    key: 'avisosPendientes',
    label: 'Avisos pendientes',
    desc: 'Cobranza por enviar',
    color: 'hsl(38 92% 50% / 0.08)',
    accent: 'hsl(38 92% 35%)',
    href: '/cobranza?alerta=avisos-pendientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    key: 'paraCDE',
    label: 'Para enviar al CDE',
    desc: 'Contratos en mora avanzada',
    color: 'hsl(262 83% 58% / 0.08)',
    accent: 'hsl(262 83% 45%)',
    href: '/cobranza?alerta=para-cde',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    key: 'oficiosCDE',
    label: 'Oficios CDE',
    desc: 'Por enviar al consejo',
    color: 'hsl(262 83% 58% / 0.08)',
    accent: 'hsl(262 83% 45%)',
    href: '/cobranza?alerta=oficios-cde',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    key: 'enCDESinCerrar',
    label: 'En CDE sin cerrar',
    desc: 'Contratos en proceso judicial',
    color: 'hsl(221 83% 53% / 0.08)',
    accent: 'hsl(221 83% 45%)',
    href: '/cobranza?alerta=cde-sin-cerrar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    key: 'porTerminar',
    label: 'Por terminar',
    desc: 'Contratos en 90 días',
    color: 'hsl(142 71% 45% / 0.08)',
    accent: 'hsl(142 71% 32%)',
    href: '/contratos?alerta=por-terminar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    key: 'sinAceptar',
    label: 'Sin aceptar',
    desc: 'Contratos con 15+ días',
    color: 'hsl(215 16% 47% / 0.08)',
    accent: 'hsl(215 16% 40%)',
    href: '/contratos?alerta=sin-aceptar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
];

function SkeletonCard() {
  return (
    <div className="stat-card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: '36px', width: '60px', background: 'hsl(var(--muted))', borderRadius: '6px', marginBottom: '12px' }} />
      <div style={{ height: '14px', width: '80%', background: 'hsl(var(--muted))', borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '12px', width: '60%', background: 'hsl(var(--muted))', borderRadius: '4px' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<AlertaCount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)?.[1];
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/alertas/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(setAlertas)
      .catch(() => setAlertas({ sinAceptar: 0, porTerminar: 0, paraCDE: 0, cuotasVencidas: 0, avisosPendientes: 0, oficiosCDE: 0, enCDESinCerrar: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const total = alertas ? Object.values(alertas).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'hsl(var(--background))' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Resumen de alertas y gestión activa</p>
          </div>
          {alertas && total > 0 && (
            <div style={{
              background: 'hsl(0 84% 60% / 0.1)',
              border: '1px solid hsl(0 84% 60% / 0.2)',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: 'hsl(0 72% 45%)', fontSize: '13px', fontWeight: 600 }}>{total}</span>
              <span style={{ color: 'hsl(0 72% 45%)', fontSize: '12px' }}>alertas activas</span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
            : alertaConfig.map(({ key, label, desc, color, accent, href, icon }) => (
                <a
                  key={key}
                  href={href}
                  className="stat-card"
                  style={{ textDecoration: 'none', display: 'block', background: alertas && alertas[key] > 0 ? color : 'hsl(var(--card))' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: alertas && alertas[key] > 0 ? `${accent}20` : 'hsl(var(--muted))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: alertas && alertas[key] > 0 ? accent : 'hsl(var(--muted-foreground))',
                    }}>
                      {icon}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: alertas && alertas[key] > 0 ? accent : 'hsl(var(--muted-foreground))',
                    lineHeight: 1,
                    marginBottom: '6px',
                    letterSpacing: '-0.02em',
                  }}>
                    {alertas ? alertas[key] : '—'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{desc}</div>
                </a>
              ))}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '12px' }}>Accesos rápidos</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { href: '/clientes', label: 'Nuevo cliente' },
              { href: '/contratos', label: 'Ver contratos' },
              { href: '/cobranza', label: 'Buscar deuda' },
              { href: '/pagos', label: 'Cargar pagos' },
              { href: '/reportes', label: 'Generar reporte' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="btn btn-secondary"
                style={{ textDecoration: 'none', fontSize: '12px' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
