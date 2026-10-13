import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

// El contenido de la landing (seguros, coberturas, confianza, zona de atención y activaciones)
// vive en la página principal; el sitemap debe listar URLs indexables, no fragmentos #ancla.
const publishedRoutes = [
  { route: '/', priority: 1, changeFrequency: 'weekly' as const },
  { route: '/aviso-privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
  { route: '/terminos', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedRoutes.map(({ route, priority, changeFrequency }) => ({
    url: new URL(route, siteConfig.url).toString(),
    changeFrequency,
    priority,
  }));
}
