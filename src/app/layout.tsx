import type { Metadata } from 'next';
import './globals.css';
import { BRAND } from '@/lib/brand';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="flex bg-black relative h-dvh overflow-hidden antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
