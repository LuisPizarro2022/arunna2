import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { LangProvider } from '@/components/lang-provider';

export const metadata: Metadata = {
  title: 'PixelMouse',
  description: 'Local-only CRM for assisted WhatsApp Web sending.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
