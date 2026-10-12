'use client';
import Image from 'next/image';
import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { siteConfig, whatsappMessages } from '@/config/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

const nav = [['Inicio', '#inicio'], ['Coberturas', '#coberturas'], ['Beneficios', '#beneficios'], ['Preguntas frecuentes', '#faq'], ['Contacto', '#contacto']];

export function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <header className="sticky top-0 z-50 border-b border-qualitas-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <a href="#inicio" onClick={closeMenu} aria-label="Quálitas — inicio" className="focus-ring flex min-w-0 items-center gap-3 rounded-lg">
          <Image src="/qualitas-logo.png" alt="Quálitas Seguros" width={170} height={58} priority className="h-auto max-h-12 w-auto max-w-[170px] object-contain" />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-5 text-sm font-semibold xl:flex">
          {nav.map(([label, href]) => <a className="focus-ring rounded-md py-2 hover:text-qualitas-purple" key={href} href={href}>{label}</a>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <a onClick={() => trackEvent('whatsapp_click', { placement: 'header' })} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-qualitas-aqua px-4 text-sm font-bold text-qualitas-aqua transition-colors hover:bg-cyan-50" href={buildWhatsAppUrl(whatsappMessages.general)}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>
          <a className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-qualitas-purple px-5 text-sm font-bold text-white transition-colors hover:brightness-90" href="#cotizador">Cotizar mi auto</a>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <a className="focus-ring rounded-xl bg-qualitas-purple px-3 py-3 text-sm font-bold text-white" href="#cotizador">Cotizar</a>
          <button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="mobile-navigation" className="focus-ring rounded-xl border border-qualitas-border p-3" onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" aria-label="Navegación móvil" className="border-t border-qualitas-border bg-white px-4 py-3 lg:hidden">
        {nav.map(([label, href]) => <a onClick={closeMenu} className="focus-ring block rounded-lg px-3 py-3 font-semibold hover:bg-slate-50" key={href} href={href}>{label}</a>)}
        <a onClick={() => { trackEvent('whatsapp_click', { placement: 'mobile_menu' }); closeMenu(); }} className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-qualitas-aqua font-bold text-qualitas-aqua" href={buildWhatsAppUrl(whatsappMessages.general)}><MessageCircle size={18} aria-hidden="true" />Hablar por WhatsApp</a>
      </nav>}
    </header>
  );
}
