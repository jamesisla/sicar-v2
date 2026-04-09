import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SICAR v2 — Sistema de Administración de Cartera de Arriendos',
  description: 'Ministerio de Bienes Nacionales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
