'use client';
import { MessageCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { siteConfig, whatsappMessages } from '@/config/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function LeadForm() {
  const [notice, setNotice] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(true);
    trackEvent('footer_lead_completed');
  }
  return (
    <section id="contacto" className="bg-qualitas-surface px-4 py-14">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-qualitas-border bg-white p-5 shadow-soft md:grid-cols-[.9fr_1.5fr] md:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-qualitas-aqua">Atención personalizada</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">¿Quieres que te orientemos?</h2>
          <p className="mt-3 text-slate-600">Contáctanos para revisar opciones de seguro para tu vehículo.</p>
          <a className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-qualitas-aqua px-5 py-3 font-bold text-white" href={buildWhatsAppUrl(whatsappMessages.general)}><MessageCircle size={18} aria-hidden="true" />WhatsApp · {siteConfig.whatsapp.display}</a>
          <p className="mt-3 text-sm text-slate-600"><a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
        </div>
        <div>
          <form onSubmit={submit} onFocus={() => trackEvent('footer_lead_started')} className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-name">Nombre</label><input required id="lead-name" name="name" autoComplete="name" placeholder="Tu nombre" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
            <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-phone">Teléfono o WhatsApp</label><input required id="lead-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="55 0000 0000" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
            <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-email">Correo electrónico</label><input required id="lead-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
            <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-product">¿Qué deseas asegurar?</label><select id="lead-product" name="product" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3"><option>Auto</option><option>Moto</option><option>Pickup</option><option>Otro</option></select></div>
            <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2"><input required type="checkbox" className="mt-1 size-4 accent-qualitas-purple" />He leído y acepto el <a className="underline" href="/aviso-privacidad">Aviso de Privacidad</a>.</label>
            <button className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition-colors hover:brightness-90 sm:col-span-2">Preparar contacto</button>
          </form>
          <p aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {notice ? 'Este formulario es una demostración: tus datos no se guardaron ni enviaron. Para solicitar atención, utiliza el botón de WhatsApp.' : 'Por ahora, este formulario no envía ni almacena datos. Puedes contactar directamente por WhatsApp o correo.'}
          </p>
        </div>
      </div>
    </section>
  );
}
