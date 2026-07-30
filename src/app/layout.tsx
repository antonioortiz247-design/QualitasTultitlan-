import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: 'Seguro de Auto Quálitas en Cuautitlán | Cotiza tu Auto', description: 'Cotiza tu seguro de auto Quálitas en Cuautitlán y recibe atención personalizada. Conoce opciones de cobertura y solicita tu cotización.', alternates: { canonical: '/' }, openGraph: { title: 'Seguro de Auto Quálitas en Cuautitlán | Cotiza tu Auto', description: 'Cotiza tu seguro de auto Quálitas en Cuautitlán y recibe atención personalizada.', url: '/', siteName: siteConfig.businessName, locale: 'es_MX', type: 'website' }, twitter: { card: 'summary_large_image', title: 'Seguro de Auto Quálitas en Cuautitlán | Cotiza tu Auto', description: 'Cotiza tu seguro de auto Quálitas en Cuautitlán y recibe atención personalizada.' }, robots: { index: true, follow: true } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es-MX"><body className={inter.className}>{children}</body></html>; }
