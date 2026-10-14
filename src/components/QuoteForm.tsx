'use client';

import { CheckCircle, MessageCircle, Search, CarFront, BadgeCheck, Car, ClipboardCheck, ShieldCheck, UserRound, ContactRound } from 'lucide-react';
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
  subbrand?: string;
  years: string[];
};

export function QuoteForm() {
  const [step, setStep] = useState(1);
  const [coverage, setCoverage] = useState('amplio');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableSubbrands, setAvailableSubbrands] = useState<string[]>([]);
  const [availableVersions, setAvailableVersions] = useState<Vehicle[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedSubbrand, setSelectedSubbrand] = useState('');
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
        const response = await fetch('/api/vehicle-catalog?q=' + encodeURIComponent(selectedBrand && !term.toLocaleLowerCase('es-MX').includes(selectedBrand.toLocaleLowerCase('es-MX')) ? selectedBrand + ' ' + term : term), { signal: controller.signal });
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
  }, [search, manual, selected, selectedBrand]);

  useEffect(() => {
    const action = step === 2 ? 'years' : step === 3 ? 'models' : step === 4 ? 'subbrands' : step === 5 ? 'versions' : '';
    if (!action || !selectedBrand) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ action, brand: selectedBrand });
    if (selectedYear) params.set('year', selectedYear);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedSubbrand) params.set('subbrand', selectedSubbrand);
    setLoading(true);
    setCatalogError(false);
    fetch('/api/vehicle-catalog?' + params.toString(), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo consultar el catálogo');
        return response.json();
      })
      .then((payload) => {
        if (action === 'years') setAvailableYears(payload.years ?? []);
        if (action === 'models') setAvailableModels(payload.models ?? []);
        if (action === 'subbrands') setAvailableSubbrands(payload.subbrands ?? []);
        if (action === 'versions') setAvailableVersions(payload.versions ?? []);
      })
      .catch((error) => {
        if (!(error instanceof Error && error.name === 'AbortError')) setCatalogError(true);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [step, selectedBrand, selectedYear, selectedModel, selectedSubbrand]);

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
    const vehicleYear = selectedYear && vehicle.years.includes(selectedYear)
      ? selectedYear
      : [...vehicle.years].sort((a, b) => Number(b) - Number(a))[0] || '';
    setSelected(vehicle);
    setSelectedBrand(vehicle.brand);
    setSelectedYear(vehicleYear);
    setSelectedModel(vehicle.type);
    setSelectedSubbrand(vehicle.subbrand || '');
    setStep(6);
    setManual(false);
    setSearch('');
    setResults([]);
    setData((current) => ({
      ...current,
      brand: vehicle.brand,
      model: vehicle.type,
      version: vehicle.description || vehicle.type,
      year: vehicleYear,
      cate: vehicle.cate,
      cve: vehicle.cve,
      brandCode: vehicle.brandCode,
      subbrand: vehicle.subbrand || '',
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
    if (step === 2 && manual) {
      if (validate(['brand', 'model', 'version', 'year', 'vehicleType'])) setStep(6);
    } else if (step === 5) {
      if (availableSubbrands.length === 0) {
        setSelectedSubbrand('');
        setStep(6);
      } else if (selectedSubbrand) {
        setStep(6);
      } else {
        setErrors({ subbrand: 'Selecciona una submarca para continuar.' });
      }
    } else if (step === 6) {
      trackEvent('quote_step_2_completed', { coverage });
      setStep(7);
    } else if (step === 7 && validate(['zip', 'age'])) {
      setStep(8);
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
    'Paquete solicitado: ' + (coverage === 'amplio' ? 'Amplio' : 'Limitado') + ' (opción orientativa, sin prima calculada)',
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
          <a onClick={() => trackEvent('whatsapp_click', { placement: 'quote_success' })} className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-qualitas-aqua px-5 py-3 font-bold text-white" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.quote(messageDetails))}><MessageCircle size={18} aria-hidden="true" />Continuar por WhatsApp</a>
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
            <p className="mt-2 max-w-xl text-slate-600">Avanza pantalla por pantalla: marca, modelo, versión, cobertura y datos de contacto. Guardaremos tu solicitud para seguimiento del asesor.</p>
          </div>
          <ol aria-label="Progreso del formulario" className="grid grid-cols-2 gap-2 text-center text-xs font-bold sm:grid-cols-4 lg:grid-cols-8 sm:text-sm">
            {[
              { label: 'Marca', Icon: BadgeCheck },
              { label: 'Año', Icon: ClipboardCheck },
              { label: 'Modelo', Icon: Car },
              { label: 'Submarca', Icon: BadgeCheck },
              { label: 'Versión', Icon: ClipboardCheck },
              { label: 'Cobertura', Icon: ShieldCheck },
              { label: 'Conductor', Icon: UserRound },
              { label: 'Contacto', Icon: ContactRound },
            ].map(({ label, Icon }, index) => (
              <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={'rounded-xl px-2 py-3 transition-colors ' + (step === index + 1 ? 'bg-qualitas-purple text-white shadow-sm' : step > index + 1 ? 'bg-cyan-50 text-qualitas-aqua' : 'bg-slate-100 text-slate-600')}>
                <span className="mb-1 flex justify-center" aria-hidden="true">
                  {step > index + 1 ? <CheckCircle size={20} strokeWidth={2.5} /> : <Icon size={20} strokeWidth={2} />}
                </span>
                <span className="block">{label}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-qualitas-aqua transition-all" style={{ width: ((step / 8) * 100) + '%' }} /></div>
        <form onSubmit={submit} className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            {step === 1 && (
              <div className="md:col-span-2">
                <h3 className="mb-2 text-lg font-bold text-qualitas-purple">¿Qué marca es tu auto?</h3>
                <p className="mb-5 text-sm text-slate-600">Busca por marca, modelo, versión o año, o selecciona una marca del catálogo.</p>
                <div className="mb-6">
                  <label htmlFor="vehicle-search" className="mb-2 block text-sm font-bold text-slate-800">Buscar mi vehículo</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-qualitas-aqua" size={21} aria-hidden="true" />
                    <input
                      id="vehicle-search"
                      type="search"
                      value={search}
                      onChange={(event) => { setSearch(event.target.value); setSelected(null); setManual(false); }}
                      placeholder="Ej. Nissan Versa 2022, Honda CR-V..."
                      autoComplete="off"
                      className="focus-ring min-h-14 w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 text-base shadow-sm"
                      aria-describedby="vehicle-search-help"
                    />
                  </div>
                  <p id="vehicle-search-help" className="mt-2 text-xs text-slate-500">Escribe al menos 2 caracteres. Puedes buscar por marca, modelo, versión o año.</p>
                  {loading && search.trim().length >= 2 && <p role="status" className="mt-3 text-sm text-slate-600">Buscando vehículos en el catálogo…</p>}
                  {catalogError && search.trim().length >= 2 && <p role="alert" className="mt-3 text-sm text-red-700">No se pudo consultar el catálogo. Puedes intentar de nuevo o elegir una marca.</p>}
                  {search.trim().length >= 2 && !loading && !catalogError && (
                    <div className="mt-3 space-y-2" aria-live="polite">
                      {results.length > 0 ? results.map((vehicle, index) => (
                        <button key={vehicle.cve + '-' + index} type="button" onClick={() => chooseVehicle(vehicle)} className="focus-ring flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#0096AE] hover:bg-cyan-50">
                          <span className="min-w-0">
                            <span className="block font-bold text-slate-900">{vehicle.brand} {vehicle.type}</span>
                            <span className="mt-1 block text-sm text-slate-600">{vehicle.description || vehicle.subbrand || 'Versión registrada en catálogo'}</span>
                            <span className="mt-1 block text-xs text-slate-500">Años disponibles: {vehicle.years.slice().sort((a, b) => Number(b) - Number(a)).slice(0, 6).join(', ') || 'Consultar con asesor'}</span>
                          </span>
                          <span className="shrink-0 rounded-lg bg-[#941B80] px-3 py-2 text-sm font-bold text-white">Elegir</span>
                        </button>
                      )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No encontramos coincidencias. Prueba con otra palabra o selecciona la marca abajo.</p>}
                    </div>
                  )}
                </div>
                <div className="mb-4 border-t border-slate-200 pt-5">
                  <h4 className="mb-3 text-sm font-bold text-slate-700">O selecciona una marca</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { name: 'Honda', logo: 'Honda.png' },
                    { name: 'Chevrolet', logo: 'Chevrolet.png' },
                    { name: 'Hyundai', logo: 'Hyundai.png' },
                    { name: 'Volkswagen', logo: 'Volkswagen.png' },
                    { name: 'Toyota', logo: 'Toyota.png' },
                    { name: 'Ford', logo: 'Ford.png' },
                    { name: 'Nissan', logo: 'Nissan.png' },
                    { name: 'Kia', logo: 'Kia.png' },
                    { name: 'Mazda', logo: 'Mazda.png' },
                  ].map(({ name, logo }) => (
                    <button
                      key={name}
                      type="button"
                      aria-label={name}
                      onClick={() => { setSelectedBrand(name); setSelected(null); setManual(false); setSearch(''); setSelectedYear(''); setSelectedModel(''); setSelectedSubbrand(''); setErrors({}); setStep(2); }}
                      className="focus-ring flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-700 transition hover:-translate-y-0.5 hover:border-[#0096AE] hover:shadow-sm"
                    >
                      <img src={`/images/marcas/LogosCotizador/${logo}`} alt="" aria-hidden="true" loading="lazy" className="h-9 w-full max-w-28 object-contain" />
                      <span className="text-xs font-semibold">{name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <button type="button" onClick={() => { setSelectedBrand(''); startManual(); setStep(2); }} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-qualitas-aqua px-4 py-2 font-semibold text-qualitas-aqua"><CarFront size={18} aria-hidden="true" />Mi vehículo no aparece</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="md:col-span-2">
                {manual ? (
                  <div className="grid gap-4 rounded-xl border border-qualitas-border bg-slate-50 p-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><h3 className="text-lg font-bold text-qualitas-purple">Captura los datos de tu vehículo</h3><p className="mt-1 text-sm text-slate-600">No encontramos el vehículo en el catálogo; completa estos campos para continuar.</p></div>
                    {input('brand', 'Marca')}
                    {input('model', 'Modelo')}
                    {input('version', 'Versión')}
                    {input('year', 'Año del vehículo', 'number')}
                    {input('vehicleType', 'Tipo de vehículo')}
                    <button type="button" onClick={() => { setManual(false); setStep(1); }} className="text-left text-sm font-semibold underline sm:col-span-2">Volver a elegir una marca</button>
                  </div>
                ) : <>
                <h3 className="text-lg font-bold text-qualitas-purple">¿De qué año es tu auto?</h3>
                <p className="mt-1 text-sm text-slate-600">Solo mostramos años disponibles para {selectedBrand} en el catálogo.</p>
                {loading && <p role="status" className="mt-3 text-sm text-slate-600">Consultando años disponibles…</p>}
                {catalogError && <p role="alert" className="mt-3 text-sm text-red-700">No se pudo cargar el catálogo. Intenta de nuevo.</p>}
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {availableYears.map((year) => <button key={year} type="button" onClick={() => { setSelectedYear(year); setSelectedModel(''); setSelectedSubbrand(''); setSelected(null); setStep(3); }} className="focus-ring min-h-12 rounded-lg border border-slate-200 bg-white px-3 font-semibold hover:border-[#0096AE] hover:bg-cyan-50">{year}</button>)}
                </div>
                {!loading && availableYears.length === 0 && !catalogError && <p className="mt-4 text-sm text-slate-600">No encontramos años para esta marca. Puedes capturar los datos manualmente.</p>}
                <button type="button" onClick={() => { startManual(); setStep(2); }} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-qualitas-aqua px-4 py-2 font-semibold text-qualitas-aqua"><CarFront size={18} aria-hidden="true" />Capturar vehículo manualmente</button>
                </>}
              </div>
            )}
            {step === 3 && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-qualitas-purple">Elige el modelo</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedBrand} · {selectedYear}</p>
                {loading && <p role="status" className="mt-3 text-sm text-slate-600">Buscando modelos…</p>}
                {catalogError && <p role="alert" className="mt-3 text-sm text-red-700">No se pudo cargar el catálogo.</p>}
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableModels.map((model) => <button key={model} type="button" onClick={() => { setSelectedModel(model); setSelectedSubbrand(''); setSelected(null); setStep(4); }} className="focus-ring min-h-14 rounded-xl border border-slate-200 bg-white p-4 text-left font-semibold hover:border-[#0096AE] hover:bg-cyan-50">{model}</button>)}
                </div>
                {!loading && availableModels.length === 0 && !catalogError && <p className="mt-4 text-sm text-slate-600">No hay modelos disponibles para este año.</p>}
              </div>
            )}
            {step === 4 && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-qualitas-purple">Elige la submarca</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedBrand} · {selectedYear} · {selectedModel}</p>
                {loading && <p role="status" className="mt-3 text-sm text-slate-600">Buscando submarcas…</p>}
                {catalogError && <p role="alert" className="mt-3 text-sm text-red-700">No se pudo cargar el catálogo.</p>}
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableSubbrands.map((subbrand) => <button key={subbrand} type="button" onClick={() => { setSelectedSubbrand(subbrand); setSelected(null); setStep(5); }} className="focus-ring min-h-14 rounded-xl border border-slate-200 bg-white p-4 text-left font-semibold hover:border-[#0096AE] hover:bg-cyan-50">{subbrand}</button>)}
                </div>
                {!loading && availableSubbrands.length === 0 && !catalogError && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-600">Este modelo no tiene submarcas separadas en el catálogo.</p><button type="button" onClick={() => { setSelectedSubbrand(''); setStep(5); }} className="focus-ring mt-3 rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white">Continuar</button></div>}
              </div>
            )}
            {step === 5 && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-qualitas-purple">Elige la versión</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedBrand} · {selectedYear} · {selectedModel}{selectedSubbrand ? ' · ' + selectedSubbrand : ''}</p>
                {loading && <p role="status" className="mt-3 text-sm text-slate-600">Buscando versiones disponibles…</p>}
                {catalogError && <p role="alert" className="mt-3 text-sm text-red-700">No se pudo cargar el catálogo.</p>}
                <div className="mt-5 space-y-2">
                  {availableVersions.map((version, index) => <button key={version.cve + '-' + index} type="button" onClick={() => { setSelected(version); setData((current) => ({ ...current, brand: version.brand, model: version.type, version: version.description || version.type, year: selectedYear, cate: version.cate, cve: version.cve, brandCode: version.brandCode, vehicleType: '', subbrand: version.subbrand || selectedSubbrand })); setStep(6); }} className="focus-ring w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-[#0096AE] hover:bg-cyan-50"><span className="block font-semibold">{version.description || version.type}</span><span className="mt-1 block text-sm text-slate-600">Año {selectedYear}{version.subbrand ? ' · ' + version.subbrand : ''}</span></button>)}
                </div>
                {!loading && availableVersions.length === 0 && !catalogError && <p className="mt-4 text-sm text-slate-600">No hay versiones para esta selección.</p>}
              </div>
            )}
                        {step === 6 && (
              <div className="md:col-span-2">
                <h3 className="text-center text-xl font-extrabold text-qualitas-aqua sm:text-2xl">Elige una opción de cobertura</h3>
                <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">Selecciona el paquete que quieres consultar. Las sumas mostradas corresponden a los parámetros que nos proporcionaste; la contratación y el alcance final se confirman en la carátula de la póliza.</p>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  <button type="button" onClick={() => setCoverage('amplio')} aria-pressed={coverage === 'amplio'} className={'focus-ring overflow-hidden rounded-2xl border-2 text-left transition ' + (coverage === 'amplio' ? 'border-[#941B80] bg-[#941B80] text-white shadow-xl' : 'border-slate-200 bg-white text-slate-800 hover:border-[#941B80]/50')}>
                    <span className="block px-5 py-5 text-center text-2xl font-black">Paquete Amplio</span>
                    <span className="block border-t border-current/20 px-5 py-4">
                      {[
                        ['Responsabilidad civil', '$3,000,000'],
                        ['Gastos médicos ocupantes', '$250,000'],
                        ['Gastos legales', 'Incluidos'],
                        ['Muerte del conductor por accidente automovilístico', '$100,000'],
                        ['Asistencia vial (Plus si se contrata)', 'Según límites contratados'],
                        ['Daños materiales y robo total', 'Según propuesta'],
                      ].map((item) => <span key={item[0]} className="flex items-start justify-between gap-3 border-t border-current/15 py-3 text-sm"><span>{item[0]}</span><strong className="shrink-0 text-right">{item[1]}</strong></span>)}
                    </span>
                    <span className="block px-5 pb-5 text-center text-sm font-bold">{coverage === 'amplio' ? '✓ Seleccionado' : 'Seleccionar paquete'}</span>
                  </button>
                  <button type="button" onClick={() => setCoverage('limitado')} aria-pressed={coverage === 'limitado'} className={'focus-ring overflow-hidden rounded-2xl border-2 text-left transition ' + (coverage === 'limitado' ? 'border-[#0096AE] bg-cyan-50 shadow-xl' : 'border-slate-200 bg-white hover:border-[#0096AE]/50')}>
                    <span className="block px-5 py-5 text-center text-2xl font-black text-slate-800">Cobertura Limitada</span>
                    <span className="block border-t border-slate-200 px-5 py-4">
                      {[
                        ['Responsabilidad civil', '$3,000,000'],
                        ['Gastos médicos ocupantes', '$250,000'],
                        ['Gastos legales', 'Incluidos'],
                        ['Muerte del conductor por accidente automovilístico', '$100,000'],
                        ['Asistencia vial (Plus si se contrata)', 'Según límites contratados'],
                        ['Robo total', 'Según propuesta'],
                      ].map((item) => <span key={item[0]} className="flex items-start justify-between gap-3 border-t border-slate-200 py-3 text-sm text-slate-700"><span>{item[0]}</span><strong className="shrink-0 text-right">{item[1]}</strong></span>)}
                    </span>
                    <span className="block px-5 pb-5 text-center text-sm font-bold text-[#0096AE]">{coverage === 'limitado' ? '✓ Seleccionado' : 'Seleccionar paquete'}</span>
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-lg font-extrabold text-qualitas-purple">Consulta las condiciones de cada cobertura</h4>
                  {[
                    { title: 'Responsabilidad Civil · $3,000,000', text: 'Ampara la responsabilidad civil en que incurra el asegurado o una persona que use el vehículo con su consentimiento y cause daños materiales a bienes de terceros, lesiones corporales o la muerte de terceros. También contempla determinados gastos y costas de juicio y daño moral en los supuestos previstos por el contrato. El límite de $3,000,000 corresponde al parámetro indicado para este cotizador y debe reflejarse en la carátula; la cobertura opera como límite único y combinado para los riesgos que agrupa. No cubre automáticamente daños al propio vehículo ni todos los daños a bienes de terceros: aplican exclusiones, uso declarado, deducible si se contrató y demás condiciones. Condiciones Generales, cobertura 3, numerales 3.2 a 3.4, páginas impresas 16–19.' },
                    { title: 'Gastos Médicos Ocupantes · $250,000', text: 'Cubre los conceptos de atención médica previstos en el contrato por lesiones de ocupantes derivadas de un accidente automovilístico mientras viajan en el compartimiento destinado al transporte de personas. El límite de $250,000 es el parámetro indicado para este cotizador y debe constar en la carátula; opera como límite único y combinado para los riesgos de esta cobertura, no como suma automática para cada ocupante. La cobertura base opera sin deducible. Si el vehículo lleva más ocupantes que su capacidad autorizada, la indemnización por ocupante se reduce proporcionalmente. Se excluyen, entre otros conceptos, lesiones preexistentes o no derivadas del accidente, tratamientos estéticos no relacionados y gastos derivados de riñas. Condiciones Generales, cobertura 5, numerales 5.1 a 5.3, páginas impresas 26–27.' },
                    { title: 'Gastos Legales · cubiertos según lo contratado', text: 'Ampara la defensa legal del asegurado o del conductor autorizado cuando, a raíz de un accidente vial en el que participe el vehículo asegurado, se vea involucrado en procedimientos penales o civiles. Según los términos contractuales, puede incluir honorarios de abogados, gastos inherentes al proceso penal, multas impuestas por sentencia judicial, primas de fianzas o cauciones y gestiones para la devolución de la unidad retenida. No equivale a cubrir cualquier asunto legal ni cualquier gasto sin límite: aplican los alcances, límites, obligaciones y exclusiones de esta cobertura. Debe notificarse el siniestro y atenderse el procedimiento conforme a la póliza. Condiciones Generales, cobertura 4, páginas impresas 22–26.' },
                    { title: 'Muerte del conductor por accidente automovilístico · $100,000', text: 'La cobertura 15 no se limita al fallecimiento: contempla las pérdidas expresamente enumeradas en sus condiciones. Si el accidente cubierto produce la muerte dentro de los 90 días naturales siguientes, corresponde el 100% de la suma asegurada contratada para esta cobertura. El conductor debe usar el vehículo con consentimiento expreso o tácito del asegurado y aplican las exclusiones contractuales. El monto de $100,000 es el parámetro indicado para este cotizador; debe coincidir con la carátula emitida. Condiciones Generales, cobertura 15, numerales 15.1 y 15.3, página impresa 50.' },
                    { title: 'Asistencia Vial Quálitas Plus (si está contratada)', text: 'Aplica únicamente cuando la carátula de la póliza identifique la cobertura con el distintivo “Plus”. El envío de gasolina o diésel cubre 5 eventos por vigencia anual, en sustitución —no en adición— del límite base; se mantienen las condiciones generales del servicio, incluido el máximo de 5 litros por evento. El cambio de neumático y el paso de corriente conservan 5 eventos anuales cada uno. En Kilómetro Cero, para estas dos eventualidades se considera hasta $200 por evento y vehículo; el excedente corre a cargo del beneficiario. Kilómetro Cero aplica dentro de un radio de 80 km tomando como referencia el centro de la ciudad de residencia. Para envío y pago de grúa, Plus unifica el rango en hasta 400 km por evento, contados desde el punto donde se encuentra el beneficiario y al que se envía la grúa, con un máximo de 10 eventos por vigencia anual; el límite económico se calcula conforme al tabulador de la SICT y cualquier excedente corre a cargo del beneficiario. El reembolso está sujeto a los supuestos y comprobantes exigidos en el contrato; para ciertos casos de auxilio vial se establece un reembolso de $200 por evento. Plus no modifica los demás servicios: por ejemplo, cerrajería conserva hasta 5 eventos anuales y el reembolso con proveedor sin convenio está limitado a $300 por evento, con comprobante fiscal e identificación; la ambulancia terrestre por accidente con lesiones y recomendación médica de hospitalización tiene un límite de $1,000 por evento y no tiene límite anual de eventos, pero no cubre traslados por enfermedad. Aplican las exclusiones de la cobertura 6. Este clausulado corresponde a automóviles y pick-ups de uso personal de hasta 2 ½ toneladas, sujeto a las excepciones contractuales. Referencia: Condiciones Generales, cláusulas 6, 6.1, 6.2, 6.3 y 6 Bis, páginas impresas 27–39.' },
                  ].map((item) => <details key={item.title} className="group rounded-xl border border-slate-200 bg-white open:border-[#0096AE]">
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-4 font-bold text-slate-800"><span>{item.title}</span><span aria-hidden="true" className="text-xl text-qualitas-aqua group-open:rotate-45">+</span></summary>
                    <p className="px-4 pb-4 text-sm leading-6 text-slate-600">{item.text}</p>
                  </details>)}
                </div>
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">Importante: los montos de $3,000,000, $250,000 y $100,000, así como el detalle operativo de Asistencia Vial Plus, se presentan con base en los parámetros proporcionados para este cotizador. Las Condiciones Generales describen alcances, requisitos y exclusiones, pero no sustituyen la carátula de la póliza. La cobertura solo aplica si aparece contratada y está sujeta a las condiciones correspondientes.</p>
              </div>
            )}
            {step === 7 && <>
              {input('zip', 'Código postal', 'text')}
              {input('age', 'Edad del conductor', 'number')}
              <fieldset className="md:col-span-2">
                <legend className="mb-2 font-semibold">Uso del vehículo</legend><p className="mb-3 text-sm text-slate-600">Las Condiciones Generales consultadas corresponden a vehículos de uso personal de hasta 2 ½ toneladas. Si el uso es comercial o la unidad excede ese perfil, el asesor debe revisar el producto y sus condiciones específicas; no se debe asumir que este clausulado aplica.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Particular', 'Comercial'].map((usage) => <label className="flex min-h-12 items-center gap-3 rounded-xl border border-qualitas-border p-4" key={usage}><input name="usage" type="radio" checked={data.usage === usage} onChange={() => setData((current) => ({ ...current, usage }))} className="size-4 accent-qualitas-purple" />{usage}</label>)}
                </div>
              </fieldset>
            </>}
            {step === 8 && <>
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
            {step < 8 ? <button type="button" onClick={next} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 sm:min-w-44">Continuar</button> : <button type="submit" disabled={saving} className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 font-bold text-white transition-colors hover:brightness-90 disabled:cursor-wait disabled:opacity-60 sm:min-w-52">{saving ? 'Enviando solicitud…' : 'Solicitar cotización'}</button>}
          </div>
          <div className="mt-5 rounded-xl border border-[#0096AE]/20 bg-cyan-50/60 p-4">
            <p className="text-sm font-bold text-slate-800">¿Qué pasa después?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">Registraremos tu solicitud para dar seguimiento. El asesor revisará los datos y podrá orientarte sobre las opciones disponibles. Este formulario no genera una póliza ni una cotización oficial.</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Tus datos se utilizarán conforme al <a className="font-semibold underline underline-offset-2" href="/aviso-privacidad">Aviso de Privacidad</a>.</p>
          </div>
        </form>
      </div>
    </section>
  );
}