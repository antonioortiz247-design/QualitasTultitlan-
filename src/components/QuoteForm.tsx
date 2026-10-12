'use client';

import { CheckCircle, MessageCircle, Search, CarFront } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { whatsappMessages } from '@/config/site';
import { trackEvent } from '@/lib/analytics';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

type Vehicle = {
  cate: string;
  cve: string;
  brandCode: string;
  brand: string;
  type: string;
  description: string;
  years: string[];
};

export function QuoteForm() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, string>>({ usage: 'Particular' });
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const term = search.trim();
    if (manual || selected || term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setCatalogError(false);
      try {
        const response = await fetch('/api/vehicle-catalog?q=' + encodeURIComponent(term), { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo consultar el catálogo');
        const payload = await response.json();
        setResults(payload.vehicles ?? []);
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) setCatalogError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, manual, selected]);

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
    if (keys.includes('zip') && data.zip && !/^\d{5}$/.test(data.zip)) nextErrors.zip = 'Ingresa un código postal de 5 dígitos.';
    if (keys.includes('age') && data.age && (Number(data.age) < 16 || Number(data.age) > 100)) nextErrors.age = 'Ingresa una edad entre 16 y 100 años.';
    if (keys.includes('phone') && data.phone && data.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Ingresa un teléfono de al menos 10 dígitos.';
    if (keys.includes('email') && data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) nextErrors.email = 'Ingresa un correo válido.';
    if (keys.includes('privacy') && data.privacy !== 'yes') nextErrors.privacy = 'Debes aceptar el aviso de privacidad.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function chooseVehicle(vehicle: Vehicle) {
    setSelected(vehicle);
    setManual(false);
    setSearch('');
    setResults([]);
    setData((current) => ({
      ...current,
      brand: vehicle.brand,
      model: vehicle.description || vehicle.type,
      version: vehicle.type,
      year: vehicle.years[vehicle.years.length - 1] || '',
      cate: vehicle.cate,
      cve: vehicle.cve,
      brandCode: vehicle.brandCode,
    }));
    setErrors({});
  }

  function startManual() {
    setSelected(null);
    setManual(true);
    setSearch('');
    setResults([]);
    setData((current) => ({ ...current, brand: '', model: '', version: '', year: '', vehicleType: '', cate: '', cve: '', brandCode: '' }));
    setErrors({});
  }

  function next() {
    if (step === 1) {
      const keys = manual ? ['brand', 'model', 'version', 'year', 'vehicleType'] : ['brand', 'model', 'version', 'year'];
      if (validate(keys)) {
        trackEvent('quote_step_1_completed');
        setStep(2);
      }
    } else if (step === 2 && validate(['zip', 'age'])) {
      trackEvent('quote_step_2_completed');
      setStep(3);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(['name', 'phone', 'email', 'privacy'])) return;
    setSaving(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name, phone: data.phone, email: data.email,
          zip: data.zip, age: data.age, usage: data.usage,
          brand: data.brand, model: data.model, version: data.version,
          year: data.year, vehicleType: data.vehicleType || '',
          cate: data.cate || '', cve: data.cve || '', brandCode: data.brandCode || '',
          manual, privacyAccepted: data.privacy === 'yes',
          source: typeof window !== 'undefined' ? window.location.search : '',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No pudimos guardar tu solicitud. Inténtalo de nuevo.');
      setData((current) => ({ ...current, folio: result.folio || '' }));
      trackEvent('quote_request_saved', { method: 'supabase' });
      setDone(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos guardar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function input(key: string, label: string, type = 'text') {
    const errorId = key + '-error';
    return (
      <div key={key}>
        <label className="mb-1 block text-sm font-semibold" htmlFor={key}>{label}</label>
        <input
          id={key}
          name={key}
          type={type}
          min={key === 'year' ? 1980 : key === 'age' ? 16 : undefined}
          max={key === 'year' ? new Date().getFullYear() + 1 : key === 'age' ? 100 : undefined}
          inputMode={key === 'zip' || key === 'phone' || key === 'year' || key === 'age' ? 'numeric' : undefined}
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
    data.folio ? 'Folio de seguimiento: ' + data.folio : '',
    'Vehículo: ' + data.brand + ' ' + data.model + '; tipo/versión: ' + data.version + '; año: ' + data.year,
    manual ? 'Tipo de vehículo capturado manualmente: ' + data.vehicleType : 'CATE: ' + data.cate + '; CVE (CLAVE AMIS): ' + data.cve + '; clave de marca: ' + data.brandCode,
    'Código postal: ' + data.zip + '; edad del conductor: ' + data.age + '; uso: ' + data.usage,
    'Nombre: ' + data.name + '; teléfono: ' + data.phone + '; correo: ' + data.email,
  ].filter(Boolean).join('\n');

  if (done) {
    return (
      <section id="cotizador" className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="rounded-3xl border border-qualitas-border bg-white p-6 text-center shadow-soft md:p-10">
          <CheckCircle className="mx-auto mb-4 text-qualitas-aqua" size={56} aria-hidden="true" />
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Tu solicitud está registrada</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{data.folio ? 'Tu folio de seguimiento es ' + data.folio + '. ' : ''}Ahora puedes abrir WhatsApp para enviar los datos al asesor. Esto no representa una cotización oficial.</p>
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
            <p className="mt-2 max-w-xl text-slate-600">Busca tu vehículo en el catálogo o captura sus datos manualmente.</p>
          </div>
          <ol aria-label="Progreso del formulario" className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm">
            {['Vehículo', 'Conductor', 'Contacto'].map((label, index) => (
              <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={'rounded-xl px-3 py-3 ' + (step === index + 1 ? 'bg-qualitas-purple text-white' : step > index + 1 ? 'bg-cyan-50 text-qualitas-aqua' : 'bg-slate-100 text-slate-600')}>
                <span className="mb-1 block text-xs">{step > index + 1 ? '✓' : '0' + (index + 1)}</span>{label}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-qualitas-aqua transition-all" style={{ width: ((step / 3) * 100) + '%' }} /></div>
        <form onSubmit={submit} className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            {step === 1 && (
              <div className="md:col-span-2">
                {!manual && !selected && (
                  <>
                    <label htmlFor="vehicle-search" className="mb-2 block text-sm font-semibold">Busca por marca, tipo o versión</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      <input id="vehicle-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ej. Nissan Versa, Toyota Corolla…" autoComplete="off" className="focus-ring min-h-12 w-full rounded-xl border border-qualitas-border bg-white pl-10 pr-3" aria-describedby="vehicle-search-help" />
                    </div>
                    <p id="vehicle-search-help" className="mt-2 text-sm text-slate-500">Escribe al menos dos caracteres. El catálogo incluye distintas categorías de vehículos.</p>
                    {loading && <p className="mt-3 text-sm text-slate-600" role="status">Buscando vehículos…</p>}
                    {catalogError && <p className="mt-3 text-sm text-red-700" role="alert">No se pudo consultar el catálogo. Puedes capturar los datos manualmente.</p>}
                    {results.length > 0 && (
                      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-qualitas-border p-2" aria-label="Resultados de vehículos">
                        {results.map((vehicle, index) => (
                          <li key={vehicle.cve + '-' + vehicle.cate + '-' + index}>
                            <button type="button" onClick={() => chooseVehicle(vehicle)} className="focus-ring w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50">
                              <span className="block font-semibold">{vehicle.brand} · {vehicle.type}</span>
                              <span className="mt-1 block text-sm text-slate-600">{vehicle.description}</span>
                              <span className="mt-1 block text-xs text-slate-500">Años disponibles: {vehicle.years.join(', ')}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!loading && search.trim().length >= 2 && results.length === 0 && !catalogError && <p className="mt-3 text-sm text-slate-600">No encontramos coincidencias. Intenta otra búsqueda o captura los datos manualmente.</p>}
                    <button type="button" onClick={startManual} className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-qualitas-aqua px-4 py-2 font-semibold text-qualitas-aqua"><CarFront size={18} aria-hidden="true" />Mi vehículo no aparece</button>
                  </>
                )}
                {selected && (
                  <div className="rounded-xl border border-qualitas-aqua/40 bg-cyan-50 p-4">
                    <p className="text-sm font-bold text-qualitas-aqua">Vehículo seleccionado del catálogo</p>
                    <p className="mt-1 font-semibold">{selected.brand} · {selected.type}</p>
                    <p className="mt-1 text-sm text-slate-700">{selected.description}</p>
                    <label className="mt-3 block text-sm font-semibold" htmlFor="year">Año del vehículo</label>
                    <select id="year" value={data.year ?? ''} onChange={(e) => setData((current) => ({ ...current, year: e.target.value }))} className="focus-ring mt-1 min-h-12 w-full rounded-lg border border-qualitas-border bg-white px-3">
                      {selected.years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                    {errors.year && <p className="mt-1 text-sm text-red-700">{errors.year}</p>}
                    <button type="button" onClick={() => { setSelected(null); setSearch(''); setData((current) => ({ ...current, brand: '', model: '', version: '', year: '', cate: '', cve: '', brandCode: '' })); }} className="mt-3 text-sm font-semibold underline">Elegir otro vehículo</button>
                  </div>
                )}
                {manual && (
                  <div className="grid gap-4 rounded-xl border border-qualitas-border bg-slate-50 p-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><p className="font-bold">Captura manual del vehículo</p><p className="mt-1 text-sm text-slate-600">Escribe los datos para que el asesor pueda identificar el vehículo.</p></div>
                    {input('brand', 'Marca')}
                    {input('model', 'Modelo / descripción')}
                    {input('version', 'Versión')}
                    {input('year', 'Año del vehículo', 'number')}
                    {input('vehicleType', 'Tipo de vehículo (auto, pickup, moto, etc.)')}
                    <button type="button" onClick={() => { setManual(false); setData((current) => ({ ...current, brand: '', model: '', version: '', year: '', vehicleType: '' })); }} className="focus-ring min-h-11 text-sm font-semibold underline sm:col-span-2">Volver a buscar en el catálogo</button>
                  </div>
                )}
              </div>
            )}
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
          {submitError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{submitError}</p>}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {step > 1 && <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="focus-ring min-h-12 rounded-xl border border-qualitas-border px-5 font-bold">Regresar</button>}
            {step < 3 ? <button type="button" onClick={next} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 sm:min-w-44">Continuar</button> : <button type="submit" disabled={saving} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 disabled:cursor-wait disabled:opacity-60 sm:min-w-52">{saving ? 'Guardando solicitud…' : 'Guardar y preparar solicitud'}</button>}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">Los datos de contacto y del vehículo se guardan para dar seguimiento a tu solicitud. La cotización y las condiciones finales deben confirmarse con el asesor. La cotización y las condiciones finales deben confirmarse con el asesor.</p>
        </form>
      </div>
    </section>
  );
}
