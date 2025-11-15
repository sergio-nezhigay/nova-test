import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Nova Poshta - Створення Декларації',
  description: 'Додаток для створення декларацій відправлення Nova Poshta',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='uk'>
      <body className={inter.className}>
        <main className='min-h-screen bg-gray-50'>{children}</main>
      </body>
    </html>
  );
}
