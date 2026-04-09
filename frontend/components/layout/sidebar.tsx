'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/clientes', label: 'Clientes', icon: '👤' },
  { href: '/inmuebles', label: 'Inmuebles', icon: '🏠' },
  { href: '/contratos', label: 'Contratos', icon: '📄' },
  { href: '/cobranza', label: 'Cobranza', icon: '💰' },
  { href: '/pagos', label: 'Pagos', icon: '💳' },
  { href: '/contabilidad', label: 'Contabilidad', icon: '📊' },
  { href: '/reportes', label: 'Reportes', icon: '📈' },
  { href: '/admin', label: 'Administración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-card border-r flex flex-col">
      <div className="px-4 py-5 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SICAR v2</p>
        <p className="text-xs text-muted-foreground mt-0.5">Bienes Nacionales</p>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t">
        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}
