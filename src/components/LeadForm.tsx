'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { siteConfig, whatsappMessages } from '@/config/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

type Lead = { name: string; phone: string; email: string; product: string; privacyAccepted: boolean };

export function LeadForm() {
  const [lead, setLead] = useState<Lead>({ name: '', phone: '', email: '', product: 'Auto', privacyAccepted: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [folio, setFolio] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  function update<K extends keyof Lead>(key: K, value: Lead[K]) {
    setLead((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const response = await fetch('/api/contact-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          source: typeof window !== 'undefined' ? window.location.search : '',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No pudimos guardar tus datos. Inténtalo de nuevo.');
      setFolio(result.folio || '');
      setEmailSent(result.emailSent === true);
      trackEvent('footer_lead_completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tus datos. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const whatsappMessage = [
    'Hola, quiero solicitar atención para un seguro Quálitas.',
    folio ? 'Folio de seguimiento: ' + folio : '',
    'Nombre: ' + lead.name,
    'Teléfono / WhatsApp: ' + lead.phone,
    'Correo: ' + lead.email,
    '¿Qué desea asegurar?: ' + lead.product,
  ].filter(Boolean).join('\n');

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
          {folio ? (
            <div className="rounded-xl border border-qualitas-border bg-slate-50 p-5" role="status">
              <CheckCircle className="mb-3 text-qualitas-aqua" size={36} aria-hidden="true" />
              <h3 className="text-xl font-bold">¡Tus datos se guardaron!</h3>
              <p className="mt-2 text-slate-600">Tu folio de seguimiento es <strong>{folio}</strong>. Conserva este número para futuras consultas.</p>
              <p className="mt-2 text-sm text-slate-600">{emailSent ? 'También enviamos los datos al correo de atención.' : 'La solicitud quedó guardada. La notificación por correo aún no está configurada o no pudo enviarse.'}</p>
              <a onClick={() => trackEvent('whatsapp_click', { placement: 'footer_lead_success' })} className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-qualitas-aqua px-5 py-3 font-bold text-white" href={buildWhatsAppUrl(whatsappMessage)}><MessageCircle size={18} aria-hidden="true" />Continuar por WhatsApp</a>
              <button type="button" onClick={() => { setFolio(''); setEmailSent(false); setLead({ name: '', phone: '', email: '', product: 'Auto', privacyAccepted: false }); }} className="ml-3 mt-5 min-h-12 rounded-xl border border-qualitas-border px-4 font-semibold">Nueva solicitud</button>
            </div>
          ) : (
            <form onSubmit={submit} onFocus={() => trackEvent('footer_lead_started')} className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-name">Nombre</label><input required maxLength={150} id="lead-name" name="name" autoComplete="name" value={lead.name} onChange={(e) => update('name', e.target.value)} placeholder="Tu nombre" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
              <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-phone">Teléfono o WhatsApp</label><input required maxLength={30} id="lead-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={lead.phone} onChange={(e) => update('phone', e.target.value)} placeholder="55 0000 0000" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
              <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-email">Correo electrónico</label><input required maxLength={254} id="lead-email" name="email" type="email" autoComplete="email" value={lead.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@correo.com" className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3" /></div>
              <div><label className="mb-1 block text-sm font-semibold" htmlFor="lead-product">¿Qué deseas asegurar?</label><select id="lead-product" name="product" value={lead.product} onChange={(e) => update('product', e.target.value)} className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border px-3"><option>Auto</option><option>Moto</option><option>Pickup</option><option>Otro</option></select></div>
              <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2"><input required type="checkbox" checked={lead.privacyAccepted} onChange={(e) => update('privacyAccepted', e.target.checked)} className="mt-1 size-4 accent-qualitas-purple" />He leído y acepto el <a className="underline" href="/aviso-privacidad">Aviso de Privacidad</a>.</label>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
              <button disabled={saving} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition-colors hover:brightness-90 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{saving ? 'Guardando datos…' : 'Guardar y preparar contacto'}</button>
            </form>
          )}
          {!folio && <p aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Tus datos se guardarán para dar seguimiento a tu solicitud. Después podrás continuar por WhatsApp con tu folio de seguimiento.</p>}
        </div>
      </div>
    </section>
  );
}
