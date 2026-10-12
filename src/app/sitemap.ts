import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const publishedRoutes = ['/', '/aviso-privacidad', '/terminos'];

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedRoutes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    changeFrequency: route === '/' ? 'weekly' : 'yearly',
    priority: route === '/' ? 1 : 0.3,
  }));
}
