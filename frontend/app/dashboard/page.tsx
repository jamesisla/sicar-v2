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

const alertaLabels: { key: keyof AlertaCount; label: string; color: string; href: string }[] = [
  { key: 'cuotasVencidas', label: 'Cuotas vencidas sin aviso', color: 'bg-red-50 border-red-200 text-red-700', href: '/cobranza?alerta=cuotas-vencidas' },
  { key: 'avisosPendientes', label: 'Avisos de cobranza pendientes', color: 'bg-orange-50 border-orange-200 text-orange-700', href: '/cobranza?alerta=avisos-pendientes' },
  { key: 'paraCDE', label: 'Contratos para enviar al CDE', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', href: '/cobranza?alerta=para-cde' },
  { key: 'oficiosCDE', label: 'Oficios CDE por enviar', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', href: '/cobranza?alerta=oficios-cde' },
  { key: 'enCDESinCerrar', label: 'Contratos en CDE sin cerrar', color: 'bg-purple-50 border-purple-200 text-purple-700', href: '/cobranza?alerta=cde-sin-cerrar' },
  { key: 'porTerminar', label: 'Contratos por terminar (90 días)', color: 'bg-blue-50 border-blue-200 text-blue-700', href: '/contratos?alerta=por-terminar' },
  { key: 'sinAceptar', label: 'Contratos sin aceptar (15+ días)', color: 'bg-gray-50 border-gray-200 text-gray-700', href: '/contratos?alerta=sin-aceptar' },
];

export default function DashboardPage() {
  const [alertas, setAlertas] = useState<AlertaCount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/alertas/dashboard`, {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(setAlertas)
      .catch(() => setAlertas(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">Alertas y resumen de gestión</p>

        {loading && <p className="text-sm text-muted-foreground">Cargando alertas...</p>}

        {alertas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {alertaLabels.map(({ key, label, color, href }) => (
              <a
                key={key}
                href={href}
                className={`rounded-lg border p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow ${color}`}
              >
                <span className="text-3xl font-bold">{alertas[key]}</span>
                <span className="text-sm">{label}</span>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
