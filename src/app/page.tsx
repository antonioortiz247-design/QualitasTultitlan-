'use client';

import Image from 'next/image';
import {
  Car,
  CarFront,
  Truck,
  Construction,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  HeartPulse,
  KeyRound,
  Headphones,
  MapPin,
  ExternalLink,
  Shield,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { LeadForm } from '@/components/LeadForm';
import { QuoteForm } from '@/components/QuoteForm';
import { siteConfig, whatsappMessages } from '@/config/site';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useEffect, useRef, useState } from 'react';

const galleryImages = [
  { src: '/images/activacion-romero.jpg', alt: 'Activación de Quálitas en la oficina de Romero Rubio', title: 'Activación en Romero Rubio', detail: '13 de octubre de 2026' },
  { src: '/images/socios_comerciales.jpeg', alt: 'Logotipos de los socios comerciales de Quálitas Romero Rubio', title: 'Socios comerciales', detail: 'Alianzas locales' },
];

type Coverage = {
  name: string;
  summary: string;
  icon: LucideIcon;
  items: string[];
};

type Faq = {
  question: string;
  answer: string;
};

type Benefit = {
  icon: LucideIcon;
  title: string;
};

const heroBenefits = [
  'Cotización sin costo',
  'Atención personalizada',
  'Diferentes opciones de cobertura',
  'Seguimiento por WhatsApp',
];

const coverages: Coverage[] = [
  {
    name: 'Daños materiales',
    icon: Car,
    summary: 'Protección para daños al vehículo derivados de determinados eventos cubiertos.',
    items: [
      'Puede incluir colisión y vuelco',
      'Cristales, incendio y fenómenos naturales, conforme a condiciones',
      'Pueden aplicar deducibles y exclusiones',
    ],
  },
  {
    name: 'Robo total',
    icon: KeyRound,
    summary: 'Ampara el robo total del vehículo y ciertos daños relacionados, según la póliza.',
    items: [
      'Requiere que la cobertura esté contratada',
      'El límite y deducible se indican en la carátula',
      'El robo parcial no se considera incluido automáticamente',
    ],
  },
  {
    name: 'Responsabilidad civil',
    icon: Shield,
    summary: 'Puede cubrir la responsabilidad por daños a bienes de terceros y lesiones o fallecimiento, conforme al contrato.',
    items: [
      'Opera hasta el límite contratado',
      'La cobertura a ocupantes tiene condiciones específicas',
      'No sustituye las coberturas para daños al propio vehículo',
    ],
  },
  {
    name: 'Gastos médicos a ocupantes',
    icon: HeartPulse,
    summary: 'Puede cubrir gastos médicos de ocupantes del vehículo asegurado por lesiones derivadas de un accidente, conforme a las condiciones.',
    items: ['Límite y personas cubiertas sujetos a póliza', 'No equivale a un seguro médico general', 'Aplican definiciones y exclusiones contractuales'],
  },
  {
    name: 'Asistencia vial',
    icon: Wrench,
    summary: 'Servicios de asistencia específicos cuando la cobertura correspondiente esté contratada y se cumplan sus requisitos.',
    items: ['Los servicios y eventos tienen alcances definidos', 'Pueden existir límites por evento o vigencia', 'Consulta las condiciones antes de solicitar el servicio'],
  },
  {
    name: 'Gastos legales',
    icon: FileText,
    summary: 'Puede contemplar defensa y conceptos legales derivados de un accidente vial, dentro de los términos del contrato.',
    items: ['Aplica en los supuestos descritos en las condiciones', 'No cubre automáticamente cualquier asunto legal', 'Sujeto a límites, requisitos y exclusiones'],
  },
];

const benefits: Benefit[] = [
  { icon: Headphones, title: 'Atención especializada' },
  { icon: Shield, title: 'Opciones de cobertura' },
  { icon: Wrench, title: 'Asistencia cuando la necesitas' },
  { icon: UserRound, title: 'Atención personalizada del agente' },
];

const processSteps = [
  'Cuéntanos sobre tu auto',
  'Recibe atención personalizada',
  'Compara tus opciones',
  'Protege tu vehículo',
];

const faqs: Faq[] = [
  {
    question: '¿Todas las coberturas que aparecen en el sitio vienen incluidas?',
    answer: 'No. Las descripciones son informativas. Solo aplican las coberturas señaladas como contratadas en la carátula de la póliza. Confirma por escrito cuáles se incluyen en tu propuesta.',
  },
  {
    question: '¿Siempre se paga el total de los daños?',
    answer: 'No puede garantizarse. La indemnización depende del riesgo cubierto, suma asegurada, deducible, valuación, condiciones, exclusiones y procedencia del siniestro.',
  },
  {
    question: '¿El robo parcial está incluido con robo total?',
    answer: 'No debe asumirse. El robo parcial se maneja como cobertura específica en las condiciones generales y requiere confirmar que esté contratada en la póliza.',
  },
  {
    question: '¿Qué son el deducible y la suma asegurada?',
    answer: 'El deducible es la participación económica a cargo del asegurado en los casos previstos; la suma asegurada es el límite contratado aplicable según la cobertura. Consulta la carátula y las condiciones de tu póliza.',
  },
  {
    question: '¿Cuánto cuesta un seguro de auto Quálitas?',
    answer:
      'El costo depende del vehículo, perfil del conductor, zona, uso, coberturas, deducibles y condiciones vigentes de la póliza.',
  },
  {
    question: '¿Qué necesito para cotizar mi automóvil?',
    answer:
      'Normalmente se solicitan datos del auto, código postal, uso del vehículo y datos de contacto para dar seguimiento.',
  },
  {
    question: '¿Qué diferencia hay entre los paquetes de cobertura?',
    answer:
      'Los nombres comerciales no sustituyen el detalle contractual. Los riesgos amparados dependen de las coberturas que se indiquen como contratadas en la carátula, junto con sus límites, deducibles y exclusiones. Solicita el desglose de la cotización antes de contratar.',
  },
  {
    question: '¿Puedo asegurar un auto usado?',
    answer:
      'Sí es posible revisar opciones para autos usados, sujeto a datos del vehículo y criterios aplicables.',
  },
  {
    question: '¿Cómo puedo pagar mi seguro?',
    answer:
      'Las formas de pago disponibles se confirman al momento de la contratación y dependen de la póliza.',
  },
  {
    question: '¿Qué hago si tengo un accidente?',
    answer:
      'Mantén la calma y contacta los canales de asistencia indicados en tu póliza. Tu asesor puede orientarte sobre el proceso.',
  },
  {
    question: '¿Puedo cotizar si vivo en Cuautitlán Izcalli?',
    answer:
      'Sí, se brinda atención a Cuautitlán Izcalli y municipios cercanos indicados en esta página.',
  },
];

export default function Home() {
  const [selectedMapArea, setSelectedMapArea] = useState('Cuautitlán');
  const [selectedMapDistance, setSelectedMapDistance] = useState(0);

  const localityCoordinates: Record<string, [number, number]> = {
    'Cuautitlán': [19.673, -99.18],
    'Cuautitlán Izcalli': [19.65, -99.21],
    'Tultepec': [19.685, -99.13],
    'Tultitlán': [19.65, -99.17],
    'Tepotzotlán': [19.72, -99.22],
    'Teoloyucan': [19.745, -99.18],
    'Melchor Ocampo': [19.70, -99.14],
    'Zumpango': [19.80, -99.10],
    'Nextlalpan': [19.74, -99.07],
    'Coacalco de Berriozábal': [19.63, -99.11],
  };
  const selectedLocalityCoords = localityCoordinates[selectedMapArea] ?? localityCoordinates['Cuautitlán'];
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedMapArea + ', Estado de México, México')}&z=14&output=embed`;

  useEffect(() => {
    const coords = selectedLocalityCoords;
    const office = [19.671, -99.181];
    const radians = (value: number) => value * Math.PI / 180;
    const dLat = radians(office[0] - coords[0]);
    const dLng = radians(office[1] - coords[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(coords[0])) * Math.cos(radians(office[0])) * Math.sin(dLng / 2) ** 2;
    setSelectedMapDistance(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }, [selectedMapArea]);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const closeGallery = () => setActiveGalleryIndex(null);
  const showPreviousImage = () => setActiveGalleryIndex((current) => current === null ? 0 : (current + galleryImages.length - 1) % galleryImages.length);
  const showNextImage = () => setActiveGalleryIndex((current) => current === null ? 0 : (current + 1) % galleryImages.length);

  useEffect(() => {
    if (activeGalleryIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') showPreviousImage();
      if (event.key === 'ArrowRight') showNextImage();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeGalleryIndex]);


  return (
    <>
      <Header />
      <main id="inicio">
        <JsonLd />
        <section className="overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-qualitas-aqua">Atención en Cuautitlán y municipios cercanos</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-qualitas-purple sm:text-5xl md:text-6xl">
                Seguro de auto Quálitas en Cuautitlán
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-700">
                Conoce opciones de cobertura para tu vehículo y recibe orientación personalizada en Cuautitlán y municipios cercanos.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {heroBenefits.map((benefit) => (
                  <li className="flex items-center gap-2" key={benefit}>
                    <Check className="text-qualitas-aqua" /> {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  className="focus-ring min-h-12 rounded-xl bg-qualitas-purple px-6 py-3 text-center font-bold text-white transition-colors hover:brightness-90"
                  href="#cotizador"
                >
                  Cotizar mi auto
                </a>
                <a
                  className="focus-ring min-h-12 rounded-xl border border-qualitas-aqua px-6 py-3 text-center font-bold text-qualitas-aqua transition-colors hover:bg-cyan-50"
                  target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.hero)}
                >
                  Hablar por WhatsApp
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-600">La cotización formal depende de los datos del vehículo y las condiciones vigentes.</p>
            </div>
            <div className="relative">
              <Image
                priority
                src="/images/hero-seguro-auto.png"
                alt="Seguro de auto Quálitas"
                width={900}
                height={620}
                className="w-full rounded-3xl"
              />
              <p className="mt-2 text-center text-xs text-slate-500">Imagen ilustrativa; las condiciones se confirman en la cotización formal.</p>
            </div>
          </div>
        </section>

        <section id="nuestros-seguros" className="bg-white px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-qualitas-aqua">Encuentra una opción para ti</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Nuestros seguros</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">Conoce algunas categorías de vehículos para las que puedes consultar opciones. La disponibilidad y las coberturas se confirman de acuerdo con las características de cada unidad y la cotización.</p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#941B80]/30 hover:shadow-xl">
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#941B80]/10">
                  <div className="absolute -right-12 -top-12 size-48 rounded-full border border-[#941B80]/10 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-[#941B80]" />
                  <CarFront size={132} strokeWidth={1.1} className="relative text-[#941B80] transition-transform duration-300 group-hover:scale-105" aria-hidden="true" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#941B80] shadow-sm">Uso personal</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Autos y pickups personales</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">Consulta opciones de protección para tu automóvil o pickup de uso personal, conforme a los criterios de aceptación y las condiciones aplicables.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a href="#cotizador" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-[#941B80] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-90">Cotizar</a>
                    <a href="#coberturas" className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-[#941B80] transition hover:gap-3">Conocer más <span aria-hidden="true">→</span></a>
                  </div>
                </div>
              </article>

              <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0096AE]/40 hover:shadow-xl">
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#0096AE]/10">
                  <div className="absolute -right-12 -top-12 size-48 rounded-full border border-[#0096AE]/15 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-[#0096AE]" />
                  <Truck size={132} strokeWidth={1.1} className="relative text-[#0096AE] transition-transform duration-300 group-hover:scale-105" aria-hidden="true" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#087d91] shadow-sm">Uso comercial</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Pickups de carga</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">Solicita una revisión para una pickup destinada al trabajo o traslado de carga. El uso declarado y las características del vehículo determinan las opciones disponibles.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero consultar opciones de seguro para una pickup de carga. ¿Qué datos necesitan para revisar mi caso?')} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-[#941B80] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-90">Consultar</a>
                    <a target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero conocer los requisitos y opciones para asegurar una pickup de carga.')} className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-[#941B80] transition hover:gap-3">Conocer más <span aria-hidden="true">→</span></a>
                  </div>
                </div>
              </article>

              <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#941B80]/30 hover:shadow-xl">
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-200">
                  <div className="absolute -right-12 -top-12 size-48 rounded-full border border-slate-300 transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-[#941B80]" />
                  <Construction size={132} strokeWidth={1.1} className="relative text-slate-700 transition-transform duration-300 group-hover:scale-105" aria-hidden="true" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-sm">Trabajo especializado</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Equipo pesado</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">Si necesitas asegurar maquinaria o equipo pesado, contáctanos para revisar si existe una alternativa aplicable a la unidad y su actividad.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero consultar si hay opciones de seguro para equipo pesado. Puedo compartir tipo de unidad, marca, modelo, año y uso.')} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-[#941B80] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-90">Consultar</a>
                    <a target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero conocer qué información necesitan para revisar un seguro de equipo pesado.')} className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-[#941B80] transition hover:gap-3">Conocer más <span aria-hidden="true">→</span></a>
                  </div>
                </div>
              </article>
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">Las categorías se muestran como orientación general y no garantizan aceptación, cobertura ni emisión. Las opciones se confirman mediante cotización y documentación aplicable.</p>
          </div>
        </section>

        <QuoteForm />

        <section id="coberturas" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h2 className="text-center text-3xl font-black">Conoce algunas coberturas disponibles</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Descripción general e informativa de algunas coberturas previstas en las Condiciones Generales. La disponibilidad, alcance, suma asegurada, deducible, requisitos y exclusiones dependen de la póliza y de las coberturas señaladas como contratadas en su carátula.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {coverages.map(({ icon: Icon, ...coverage }) => (
              <article className="group rounded-2xl border border-qualitas-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft" key={coverage.name}>
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#941B80]/10 text-qualitas-purple"><Icon size={26} aria-hidden="true" /></div>
                <h3 className="text-lg font-black text-qualitas-purple">{coverage.name}</h3>
                <p className="mt-4 text-sm text-slate-700">{coverage.summary}</p>
                <ul className="mt-5 space-y-3">
                  {coverage.items.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <Check className="shrink-0 text-qualitas-aqua" size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-qualitas-aqua/30 bg-cyan-50/60 p-5 text-sm leading-relaxed text-slate-700">
            <CircleDollarSign className="mt-0.5 shrink-0 text-qualitas-aqua" size={22} aria-hidden="true" />
            <div><strong className="block text-slate-900">Antes de contratar, revisa el detalle de tu póliza</strong>
          <p className="mt-2">
            Esta información no constituye una oferta de cobertura ni garantiza que un riesgo esté amparado. Solo serán aplicables las coberturas indicadas como contratadas en la carátula de la póliza, con sus límites, deducibles, condiciones y exclusiones. Consulta las Condiciones Generales y la documentación de tu cotización antes de contratar.
          </p>
            </div>
          </div>
          <p className="mt-8 text-center">
            <a
              className="focus-ring rounded-xl border border-qualitas-purple px-6 py-3 font-bold text-qualitas-purple transition-colors hover:bg-slate-50"
              target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.coverage)}
            >
              Quiero comparar coberturas
            </a>
          </p>
        </section>

        <section id="beneficios" className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black">¿Por qué asegurar tu auto con Quálitas?</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {benefits.map(({ icon: Icon, title }) => (
                <article key={title} className="rounded-2xl border border-qualitas-border bg-white p-6">
                  <Icon className="mb-4 text-qualitas-purple" />
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Orientación clara para revisar alternativas según tu vehículo y necesidades.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="confianza" className="bg-white px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-qualitas-aqua">Atención transparente</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-qualitas-purple sm:text-4xl">Tu seguro empieza con información clara</h2>
                <p className="mt-4 leading-relaxed text-slate-600">
                  Queremos que tomes una decisión informada. Te orientamos para revisar alternativas de seguro de auto y entender qué estás contratando antes de tomar una decisión.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition hover:brightness-90" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero recibir asesoría y revisar una cotización de seguro de auto con sus coberturas, sumas aseguradas, deducibles y exclusiones.')}>
                    <Headphones size={18} aria-hidden="true" /> Solicitar asesoría
                  </a>
                  <a className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-qualitas-purple px-5 py-3 font-bold text-qualitas-purple transition hover:bg-slate-50" href={siteConfig.officeMapUrl} target="_blank" rel="noreferrer">
                    <MapPin size={18} aria-hidden="true" /> Ubicación de oficina
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#0096AE]/50">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#0096AE]/10 text-qualitas-aqua"><FileText size={23} aria-hidden="true" /></div>
                  <h3 className="mt-4 font-black text-slate-900">Condiciones por escrito</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Revisa la propuesta y confirma las coberturas contratadas, sus límites, deducibles, requisitos y exclusiones.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#0096AE]/50">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#941B80]/10 text-qualitas-purple"><Shield size={23} aria-hidden="true" /></div>
                  <h3 className="mt-4 font-black text-slate-900">Sin promesas ambiguas</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">La información del sitio es orientativa. La póliza y sus condiciones son las que determinan el alcance de la protección.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#0096AE]/50">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#0096AE]/10 text-qualitas-aqua"><Headphones size={23} aria-hidden="true" /></div>
                  <h3 className="mt-4 font-black text-slate-900">Seguimiento cercano</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Puedes iniciar tu solicitud por WhatsApp y resolver dudas sobre el proceso de cotización.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#0096AE]/50">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#941B80]/10 text-qualitas-purple"><MapPin size={23} aria-hidden="true" /></div>
                  <h3 className="mt-4 font-black text-slate-900">Presencia local</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">Consulta la ubicación de la oficina y pregunta por la atención disponible en tu municipio.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="zona-atencion" className="overflow-hidden bg-slate-50 px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-qualitas-aqua">Estamos cerca de ti</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-qualitas-purple sm:text-4xl">Nuestra zona de atención</h2>
              <p className="mt-4 text-slate-600">Atención para Cuautitlán Romero Rubio y municipios cercanos. El área sombreada es una referencia regional orientativa, no una delimitación oficial de límites municipales.</p>
            </div>
            <div className="mt-9 grid items-stretch gap-6 lg:grid-cols-[1.45fr_0.75fr]">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                <div className="relative aspect-[4/3] max-h-[500px] min-h-[320px] bg-slate-100">
                  <iframe
                    title="Mapa de Google con marcador fijo de la oficina Quálitas Romero Rubio"
                    src={googleMapEmbedUrl}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0096AE]">Zona de atención</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{selectedMapArea}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <span className="text-xs text-slate-500">Google Maps · Municipio seleccionado</span>
                  <a className="inline-flex items-center gap-2 text-sm font-bold text-[#941B80] underline underline-offset-4" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMapArea + ', Estado de México, México')}`} target="_blank" rel="noopener noreferrer">
                    Abrir indicaciones <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#941B80]/10 text-[#941B80]"><MapPin size={25} aria-hidden="true" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0096AE]">Atención regional</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">Explora los municipios</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">Al seleccionar un municipio, el mapa de Google se actualiza para mostrar esa localidad. Usa el enlace para abrir su ubicación en Google Maps.</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {[
                    { name: 'Cuautitlán', main: true },
                    { name: 'Cuautitlán Izcalli', main: true },
                    { name: 'Tultepec', main: false },
                    { name: 'Tultitlán', main: false },
                    { name: 'Tepotzotlán', main: false },
                    { name: 'Teoloyucan', main: false },
                    { name: 'Melchor Ocampo', main: false },
                    { name: 'Zumpango', main: false },
                    { name: 'Nextlalpan', main: false },
                    { name: 'Coacalco de Berriozábal', main: false },
                  ].map((area) => (
                    <button key={area.name} type="button" onClick={() => setSelectedMapArea(area.name)} aria-pressed={selectedMapArea === area.name}
                      className={selectedMapArea === area.name
                        ? 'flex min-h-11 items-center gap-2 rounded-xl border border-[#941B80] bg-[#941B80] px-3 py-2 text-left text-xs font-bold text-white shadow-md transition sm:text-sm'
                        : area.main
                          ? 'flex min-h-11 items-center gap-2 rounded-xl border border-[#941B80]/20 bg-[#941B80]/5 px-3 py-2 text-left text-xs font-semibold text-[#941B80] transition hover:border-[#941B80] hover:bg-[#941B80]/10 sm:text-sm'
                          : 'flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-[#0096AE] hover:bg-cyan-50 sm:text-sm'}>
                      <MapPin size={15} className={selectedMapArea === area.name ? 'shrink-0 text-white' : 'shrink-0 text-[#0096AE]'} aria-hidden="true" />
                      <span>{area.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-[#0096AE]/20 bg-cyan-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#087d91]">Distancia aproximada a la oficina</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{selectedMapDistance.toFixed(1)} km</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">Distancia en línea recta desde el centro aproximado de {selectedMapArea}. La distancia por carretera puede ser mayor. El marcador mostrado usa una ubicación aproximada; el enlace de abajo abre la ficha de Google Maps de la oficina.</p>
                </div>
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">¿Quieres visitarnos?</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">Consulta la ubicación exacta de la oficina antes de acudir.</p>
                  <a href="https://maps.app.goo.gl/NjsTE1j3iBgA5QvP7" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#941B80] underline underline-offset-4">Cómo llegar a la oficina <ExternalLink size={15} aria-hidden="true" /></a>
                </div>
                <a className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#941B80] px-5 py-3 font-bold text-white transition hover:brightness-90" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, quiero consultar opciones de seguro de auto para mi municipio.')}>Consultar por WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        <section id="activaciones" className="bg-white px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-qualitas-aqua">En comunidad</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-qualitas-purple sm:text-4xl">Activaciones y socios comerciales</h2>
              <p className="mt-4 text-slate-600">
                Conoce las actividades que realizamos, los eventos en los que participamos y las alianzas con negocios de nuestra comunidad. Iremos compartiendo fotografías y novedades después de cada activación.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <button type="button" onClick={() => setActiveGalleryIndex(0)} aria-label="Abrir fotografía de la activación en Romero Rubio" className="group/image absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#0096AE]">
                    <img src="/images/activacion-romero.jpg" alt="Activación de Quálitas en la oficina de Romero Rubio el 13 de octubre de 2026" className="h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-105" loading="lazy" />
                    <span className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover/image:opacity-100 group-focus-visible/image:opacity-100">Ampliar foto ↗</span>
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">13 de octubre de 2026</span>
                    <h3 className="mt-1 text-2xl font-black">Activación en Romero Rubio</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-600">Primera actividad documentada: 13 de octubre, en la oficina de Romero Rubio. En este espacio compartiremos fotografías de jornadas promocionales, eventos locales y acciones de orientación para automovilistas.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-qualitas-purple"><MapPin size={16} aria-hidden="true" /> Cuautitlán y municipios cercanos</span>
                </div>
              </article>

              <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-64 overflow-hidden bg-slate-950">
                  <button type="button" onClick={() => setActiveGalleryIndex(1)} aria-label="Abrir imagen de socios comerciales" className="group/image absolute inset-0 h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#0096AE]">
                    <img src="/images/socios_comerciales.jpeg" alt="Socios comerciales de Quálitas Romero Rubio y sus marcas" className="h-full w-full object-contain transition-transform duration-500 group-hover/image:scale-[1.02]" loading="lazy" />
                    <span className="absolute right-4 top-4 rounded-full bg-black/45 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover/image:opacity-100 group-focus-visible/image:opacity-100">Ampliar imagen ↗</span>
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider">Alianzas locales</span>
                    <h3 className="mt-1 text-2xl font-black">Socios comerciales</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-600">Un espacio para reconocer a nuestros socios comerciales, mostrar colaboraciones y dar visibilidad a las iniciativas que hacemos en conjunto.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-qualitas-purple"><Check size={16} aria-hidden="true" /> Alianzas de nuestra comunidad</span>
                </div>
              </article>
            </div>

            <div className="mt-8 rounded-2xl border border-qualitas-aqua/30 bg-cyan-50/60 p-5 text-center">
              <p className="font-bold text-slate-900">¿Participaste en una activación con nosotros?</p>
              <p className="mt-1 text-sm text-slate-600">Escríbenos para compartir información del evento o conocer cómo colaborar en próximas actividades.</p>
              <a className="focus-ring mt-4 inline-flex rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition hover:brightness-90" target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl('Hola, me interesa conocer las próximas activaciones y las opciones para colaborar como socio comercial.')}>
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-black">Seguro de Auto Quálitas en Cuautitlán</h2>
            <p className="mt-4 text-slate-700">
              Brindamos atención personalizada a clientes de Cuautitlán y municipios cercanos para revisar opciones de seguro de auto con enfoque claro, prudente y orientado a tus necesidades.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {siteConfig.serviceAreas.map((area) => (
                <span className="flex gap-2" key={area}>
                  <MapPin className="text-qualitas-aqua" size={18} />
                  {area}
                </span>
              ))}
            </div>
            <a className="focus-ring mt-6 inline-block rounded-xl bg-qualitas-aqua px-5 py-3 font-bold text-white" href="#contacto">
              Solicitar asesoría
            </a>
          </div>
          <div>
            <h2 className="text-3xl font-black">Cómo solicitar atención</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {processSteps.map((step, index) => (
                <article key={step} className="rounded-2xl border border-qualitas-border p-5">
                  <strong className="text-qualitas-purple">0{index + 1}</strong>
                  <h3 className="mt-2 font-black">{step}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        

        <section id="faq" className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="text-center text-3xl font-black">Preguntas frecuentes</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border p-4">
                <summary className="cursor-pointer font-bold">{faq.question}</summary>
                <p className="mt-3 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-qualitas-purple px-4 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <Car size={48} />
              <h2 className="mt-3 text-3xl font-black">Protege tu auto hoy</h2>
              <p className="mt-2 max-w-2xl">
                Solicita una cotización y recibe atención personalizada para encontrar una opción adecuada para tu vehículo.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="focus-ring rounded-xl bg-white px-6 py-3 font-bold text-qualitas-purple" href="#cotizador">
                Cotizar mi seguro
              </a>
              <a
                className="focus-ring rounded-xl border border-white px-6 py-3 font-bold"
                target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(whatsappMessages.general)}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <LeadForm />
      {activeGalleryIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 backdrop-blur-xl sm:p-8" role="dialog" aria-modal="true" aria-label="Galería de imágenes" onClick={closeGallery}>
          <button type="button" onClick={(event) => { event.stopPropagation(); closeGallery(); }} aria-label="Cerrar galería" className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6 sm:top-6">
            <X size={23} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); showPreviousImage(); }} aria-label="Imagen anterior" className="absolute left-2 z-20 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-6 sm:size-12">
            <ChevronLeft size={28} />
          </button>
          <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col items-center justify-center gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <img src={galleryImages[activeGalleryIndex].src} alt={galleryImages[activeGalleryIndex].alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
            </div>
            <div className="text-center text-white">
              <h3 className="text-lg font-bold sm:text-xl">{galleryImages[activeGalleryIndex].title}</h3>
              <p className="mt-1 text-sm text-white/65">{galleryImages[activeGalleryIndex].detail}</p>
              <p className="mt-2 text-xs text-white/45">{activeGalleryIndex + 1} de {galleryImages.length}</p>
            </div>
          </div>
          <button type="button" onClick={(event) => { event.stopPropagation(); showNextImage(); }} aria-label="Imagen siguiente" className="absolute right-2 z-20 flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6 sm:size-12">
            <ChevronRight size={28} />
          </button>
        </div>
      )}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-[#27232B] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <strong>{siteConfig.businessName}</strong>
          <p>{siteConfig.relationshipLabel}</p>
          <p className="mt-4 text-sm text-white/70">
            Este sitio corresponde a un agente/intermediario de seguros y no sustituye al portal oficial de Quálitas Compañía de Seguros, S.A. de C.V.
          </p>
        </div>
        <div>
          <h2 className="font-bold">NAVEGACIÓN</h2>
          <a className="mt-3 block" href="#inicio">Inicio</a>
          <a className="block" href="#nuestros-seguros">Nuestros seguros</a>
          <a className="block" href="#coberturas">Coberturas</a>
          <a className="block" href="#beneficios">Beneficios</a>
          <a className="block" href="#confianza">Confianza</a>
          <a className="block" href="https://maps.app.goo.gl/NjsTE1j3iBgA5QvP7" target="_blank" rel="noopener noreferrer">Zona de atención</a>
          <a className="block" href="#activaciones">Activaciones y socios</a>
          <a className="block" href="#faq">Preguntas frecuentes</a>
          <a className="block" href="#cotizador">Cotizar</a>
          <a className="block" href="#contacto">Contacto</a>
        </div>
        <div>
          <h2 className="font-bold">CONTACTO</h2>
          <a className="focus-ring mt-3 inline-block rounded-sm" href={siteConfig.phoneHref}>{siteConfig.phone}</a>

          <a className="focus-ring inline-block rounded-sm" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          {siteConfig.businessHours && <p>{siteConfig.businessHours}</p>}
        </div>
        <div>
          <h2 className="font-bold">LEGAL</h2>
          <a className="mt-3 block" href="/aviso-privacidad">Aviso de privacidad</a>
          <a className="block" href="/terminos">Términos y condiciones</a>
          <a className="mt-5 block text-white/80" href={siteConfig.officialQualitasUrl}>Sitio oficial Quálitas</a>
        </div>
      </div>
    </footer>
  );
}
