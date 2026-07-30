import { siteConfig } from '@/config/site';
export function buildWhatsAppUrl(message: string) { return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`; }
