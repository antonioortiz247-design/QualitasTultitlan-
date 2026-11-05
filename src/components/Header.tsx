'use client';
import Image from 'next/image';
import { Menu, MessageCircle, X, House, ShieldCheck, CarFront, UsersRound, MapPin, Megaphone, CircleHelp, Mail, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { siteConfig, whatsappMessages } from '@/config/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

const nav = [
  { label: 'Inicio', href: '#inicio', Icon: House },
  { label: 'Seguros', href: '#nuestros-seguros', Icon: ShieldCheck },
  { label: 'Coberturas', href: '#coberturas', Icon: CarFront },
  { label: 'Confianza', href: '#confianza', Icon: UsersRound },
  { label: 'Atención', href: 'https://maps.app.goo.gl/NjsTE1j3iBgA5QvP7', Icon: MapPin, external: true },
  { label: 'Activaciones', href: '#activaciones', Icon: Megaphone },
  { label: 'Preguntas frecuentes', href: '#faq', Icon: CircleHelp },
  { label: 'Contacto', href: '#contacto', Icon: Mail },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMenu = () => { setOpen(false); setMoreOpen(false); };
  const desktopPrimary = nav.slice(0, 4);
  const desktopMore = nav.slice(4);
  return (
    <header className="sticky top-0 z-50 border-b border-qualitas-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6 xl:px-8">
        <a href="#inicio" onClick={closeMenu} aria-label="Quálitas — inicio" className="focus-ring flex shrink-0 items-center rounded-lg">
          <Image src="/qualitas-logo.png" alt="Quálitas Seguros" width={155} height={54} priority className="h-auto max-h-11 w-auto max-w-[clamp(112px,12vw,155px)] object-contain" />
        </a>
        <nav aria-label="Principal" className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          {desktopPrimary.map(({ label, href, Icon }) => <a className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#941B80]/[0.07] hover:text-[#941B80] 2xl:px-3" key={href} href={href}><Icon size={15} strokeWidth={1.9} aria-hidden="true" /><span>{label}</span></a>)}
          <div className="relative shrink-0">
            <button type="button" aria-expanded={moreOpen} aria-haspopup="true" onClick={() => setMoreOpen(!moreOpen)} className="focus-ring inline-flex min-h-10 items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#941B80]/[0.07] hover:text-[#941B80] 2xl:px-3">
              Más <ChevronDown size={14} className={moreOpen ? 'rotate-180 transition-transform' : 'transition-transform'} aria-hidden="true" />
            </button>
            {moreOpen && <div className="ql-desktop-more absolute right-0 top-[calc(100%+12px)] z-[60] w-64 rounded-2xl border p-2 shadow-xl">
              {desktopMore.map(({ label, href, Icon, external }) => <a key={href} onClick={() => setMoreOpen(false)} className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#941B80]/[0.07] hover:text-[#941B80]" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}><Icon size={17} aria-hidden="true" />{label}</a>)}
            </div>}
          </div>
        </nav>
        <div className="hidden shrink-0 items-center gap-2 2xl:flex">
          <a onClick={() => trackEvent('whatsapp_click', { placement: 'header' })} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-qualitas-aqua px-3 text-xs font-bold text-qualitas-aqua transition-colors hover:bg-cyan-50" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.general)}><MessageCircle size={17} aria-hidden="true" />WhatsApp</a>
          <a className="focus-ring inline-flex min-h-10 items-center whitespace-nowrap rounded-xl bg-qualitas-purple px-4 text-xs font-bold text-white transition-colors hover:brightness-90" href="#cotizador">Cotizar mi auto</a>
        </div>
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <a className="focus-ring rounded-xl bg-qualitas-purple px-3 py-2.5 text-xs font-bold text-white sm:px-4 sm:text-sm" href="#cotizador">Cotizar</a>
          <button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="mobile-navigation" className="focus-ring rounded-xl border border-qualitas-border p-2.5 sm:p-3" onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" aria-label="Navegación móvil" className="border-t border-qualitas-border bg-white px-4 py-4 shadow-lg xl:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{nav.map(({ label, href, Icon, external }) => <a onClick={closeMenu} className="focus-ring flex min-h-12 min-w-0 items-center gap-2 rounded-xl border border-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#941B80]/20 hover:bg-[#941B80]/[0.05] hover:text-[#941B80]" key={href} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}><Icon size={17} className="shrink-0" aria-hidden="true" /><span className="min-w-0">{label}</span></a>)}</div>
        <a onClick={() => { trackEvent('whatsapp_click', { placement: 'mobile_menu' }); closeMenu(); }} className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-qualitas-aqua font-bold text-qualitas-aqua" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.general)}><MessageCircle size={18} aria-hidden="true" />Hablar por WhatsApp</a>
      </nav>}
    </header>
  );
}
