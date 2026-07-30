import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
const futureRoutes=['/','/cotizar','/seguro-auto','/seguro-auto-cuautitlan','/seguro-auto-cuautitlan-izcalli','/cobertura-amplia','/cobertura-limitada','/responsabilidad-civil','/preguntas-frecuentes','/contacto','/blog','/aviso-privacidad','/terminos'];
export default function sitemap(): MetadataRoute.Sitemap { return futureRoutes.map(route=>({url:new URL(route,siteConfig.url).toString(),lastModified:new Date(),changeFrequency:route==='/'?'weekly':'monthly',priority:route==='/'?1:.6})); }
