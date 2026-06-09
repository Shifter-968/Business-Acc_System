import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fannie Logistics Platform',
  description: 'Finance, fleet, trip, and reporting platform for trucking logistics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
