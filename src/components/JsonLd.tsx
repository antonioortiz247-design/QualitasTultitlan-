import { siteConfig } from '@/config/site';

const siteTitle = 'Seguro de Auto Quálitas en Cuautitlán y Zona Norte del Estado de México';
const siteDescription =
  'Solicita una cotización de seguro de auto Quálitas en Cuautitlán y municipios cercanos. Recibe orientación personalizada y consulta las opciones de cobertura por WhatsApp.';

export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.businessName,
        inLanguage: 'es-MX',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteConfig.url}/#webpage`,
        url: siteConfig.url,
        name: siteTitle,
        description: siteDescription,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${siteConfig.url}/#website` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
