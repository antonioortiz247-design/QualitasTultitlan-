'use client';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { whatsappMessages } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const fields = [
  ['brand', 'Marca'], ['model', 'Modelo'], ['year', 'Año'], ['version', 'Versión'],
] as const;

export function QuoteForm() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, string>>({ usage: 'Particular' });

  function validate(keys: string[]) {
    const nextErrors: Record<string, string> = {};
    keys.forEach((key) => {
      if (!data[key]?.trim()) nextErrors[key] = 'Este campo es obligatorio.';
    });
    if (keys.includes('year') && data.year) {
      const year = Number(data.year);
      if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1) {
        nextErrors.year = 'Ingresa un año válido del vehículo.';
      }
    }
    if (keys.includes('zip') && data.zip && !/^\d{5}$/.test(data.zip)) {
      nextErrors.zip = 'Ingresa un código postal de 5 dígitos.';
    }
    if (keys.includes('age') && data.age && (Number(data.age) < 16 || Number(data.age) > 100)) {
      nextErrors.age = 'Ingresa una edad entre 16 y 100 años.';
    }
    if (keys.includes('phone') && data.phone && data.phone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Ingresa un teléfono de al menos 10 dígitos.';
    }
    if (keys.includes('email') && data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      nextErrors.email = 'Ingresa un correo válido.';
    }
    if (keys.includes('privacy') && data.privacy !== 'yes') {
      nextErrors.privacy = 'Debes aceptar el aviso de privacidad.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (step === 1 && validate(['brand', 'model', 'year', 'version'])) {
      trackEvent('quote_step_1_completed');
      setStep(2);
    } else if (step === 2 && validate(['zip', 'age'])) {
      trackEvent('quote_step_2_completed');
      setStep(3);
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(['name', 'phone', 'email', 'privacy'])) return;
    setDone(true);
  }

  function input(key: string, label: string, type = 'text') {
    const errorId = `${key}-error`;
    return (
      <div key={key}>
        <label className="mb-1 block text-sm font-semibold" htmlFor={key}>{label}</label>
        <input
          id={key}
          name={key}
          type={type}
          min={key === 'year' ? 1980 : key === 'age' ? 16 : undefined}
          max={key === 'year' ? new Date().getFullYear() + 1 : key === 'age' ? 100 : undefined}
          inputMode={key === 'zip' || key === 'phone' ? 'numeric' : key === 'year' || key === 'age' ? 'numeric' : undefined}
          autoComplete={key === 'name' ? 'name' : key === 'phone' ? 'tel' : key === 'email' ? 'email' : undefined}
          value={data[key] ?? ''}
          onChange={(e) => setData((current) => ({ ...current, [key]: e.target.value }))}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={errors[key] ? errorId : undefined}
          className="focus-ring min-h-12 w-full rounded-lg border border-qualitas-border bg-white px-3"
        />
        {errors[key] && <p id={errorId} className="mt-1 text-sm text-red-700">{errors[key]}</p>}
      </div>
    );
  }

  const messageDetails = [
    `Vehículo: ${data.brand} ${data.model}, año ${data.year}, versión ${data.version}`,
    `Código postal: ${data.zip}; edad del conductor: ${data.age}; uso: ${data.usage}`,
    `Nombre: ${data.name}; teléfono: ${data.phone}; correo: ${data.email}`,
  ].join('\n');

  if (done) {
    return (
      <section id="cotizador" className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-3xl border border-qualitas-border bg-white p-6 text-center shadow-soft md:p-10">
          <CheckCircle className="mx-auto mb-4 text-qualitas-aqua" size={56} aria-hidden="true" />
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Tus datos están listos para compartir</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Esta página no envía ni guarda tu solicitud y no ha generado una cotización oficial. Abre WhatsApp para revisar y enviar el mensaje al asesor.</p>
          <a onClick={() => trackEvent('whatsapp_click', { placement: 'quote_success' })} className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-qualitas-aqua px-5 py-3 font-bold text-white" href={buildWhatsAppUrl(whatsappMessages.quote(messageDetails))}><MessageCircle size={18} aria-hidden="true" />Continuar por WhatsApp</a>
          <button type="button" onClick={() => { setDone(false); setStep(1); }} className="focus-ring ml-3 mt-6 min-h-12 rounded-xl border border-qualitas-border px-5 py-3 font-bold">Editar datos</button>
        </div>
      </section>
    );
  }

  return (
    <section id="cotizador" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 lg:px-8">
      <div className="rounded-3xl border border-qualitas-border bg-white p-5 shadow-soft md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-qualitas-aqua">Cotizador orientativo</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-qualitas-purple sm:text-3xl">Cotiza tu seguro de auto</h2>
            <p className="mt-2 max-w-xl text-slate-600">Comparte los datos básicos para preparar una consulta con el asesor.</p>
          </div>
          <ol aria-label="Progreso del formulario" className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm">
            {['Vehículo', 'Conductor', 'Contacto'].map((label, index) => (
              <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={`rounded-xl px-3 py-3 ${step === index + 1 ? 'bg-qualitas-purple text-white' : step > index + 1 ? 'bg-cyan-50 text-qualitas-aqua' : 'bg-slate-100 text-slate-600'}`}>
                <span className="mb-1 block text-xs">{step > index + 1 ? '✓' : `0${index + 1}`}</span>{label}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-qualitas-aqua transition-all" style={{ width: `${(step / 3) * 100}%` }} /></div>
        <form onSubmit={submit} className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            {step === 1 && fields.map(([key, label]) => input(key, label, key === 'year' ? 'number' : 'text'))}
            {step === 2 && <>
              {input('zip', 'Código postal', 'text')}
              {input('age', 'Edad del conductor', 'number')}
              <fieldset className="md:col-span-2">
                <legend className="mb-2 font-semibold">Uso del vehículo</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Particular', 'Comercial'].map((usage) => <label className="flex min-h-12 items-center gap-3 rounded-xl border border-qualitas-border p-4" key={usage}><input name="usage" type="radio" checked={data.usage === usage} onChange={() => setData((current) => ({ ...current, usage }))} className="size-4 accent-qualitas-purple" />{usage}</label>)}
                </div>
              </fieldset>
            </>}
            {step === 3 && <>
              {input('name', 'Nombre completo')}
              {input('phone', 'Teléfono / WhatsApp', 'tel')}
              {input('email', 'Correo electrónico', 'email')}
              <div className="md:col-span-2">
                <label className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={data.privacy === 'yes'} onChange={(e) => setData((current) => ({ ...current, privacy: e.target.checked ? 'yes' : '' }))} className="mt-1 size-4 accent-qualitas-purple" />He leído y acepto el <a className="underline" href="/aviso-privacidad">Aviso de Privacidad</a>.</label>
                {errors.privacy && <p className="mt-1 text-sm text-red-700">{errors.privacy}</p>}
              </div>
            </>}
          </div>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {step > 1 && <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="focus-ring min-h-12 rounded-xl border border-qualitas-border px-5 font-bold">Regresar</button>}
            {step < 3 ? <button type="button" onClick={next} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 sm:min-w-44">Continuar</button> : <button type="submit" className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 sm:min-w-52">Preparar solicitud</button>}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">Los datos se mantienen en esta sesión del navegador hasta que salgas de la página. No se guardan en un sistema de cotización. La cotización y las condiciones finales deben confirmarse con el asesor.</p>
        </form>
      </div>
    </section>
  );
}
