import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const siteTitle = 'Seguro de Auto Quálitas en Cuautitlán y Zona Norte del Estado de México';
const siteDescription =
  'Solicita una cotización de seguro de auto Quálitas en Cuautitlán y municipios cercanos. Recibe orientación personalizada y consulta las opciones de cobertura por WhatsApp.';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteTitle,
    template: '%s | Quálitas Cuautitlán',
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: '/',
    siteName: siteConfig.businessName,
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
