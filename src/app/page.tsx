import Image from 'next/image';
import {
  Car,
  Check,
  Headphones,
  MapPin,
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

type Coverage = {
  name: 'AMPLIA' | 'LIMITADA' | 'BÁSICA';
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
    name: 'AMPLIA',
    items: [
      'Daños materiales',
      'Robo total',
      'Responsabilidad civil',
      'Gastos médicos',
      'Asistencia vial',
    ],
  },
  {
    name: 'LIMITADA',
    items: ['Robo total', 'Responsabilidad civil', 'Gastos médicos', 'Asistencia vial'],
  },
  {
    name: 'BÁSICA',
    items: ['Responsabilidad civil', 'Asistencia', 'Protección esencial'],
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
    question: '¿Qué diferencia hay entre cobertura amplia y limitada?',
    answer:
      'Pueden variar los riesgos cubiertos. Las condiciones, coberturas y costos dependen de la póliza contratada.',
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
  return (
    <>
      <Header />
      <main id="inicio">
        <JsonLd />
        <section className="overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="font-black text-[#b0007a]">Seguro de Auto en Cuautitlán</p>
              <h1 className="mt-3 text-5xl font-black tracking-tight text-[#351044] md:text-6xl">
                Protege tu auto con Quálitas
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-700">
                Cotiza tu seguro de auto y recibe atención personalizada de un agente autorizado Quálitas en Cuautitlán.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {heroBenefits.map((benefit) => (
                  <li className="flex items-center gap-2" key={benefit}>
                    <Check className="text-[#008f8b]" /> {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  className="focus-ring min-h-12 rounded-xl bg-[#b0007a] px-6 py-3 text-center font-bold text-white"
                  href="#cotizador"
                >
                  Cotizar mi auto
                </a>
                <a
                  className="focus-ring min-h-12 rounded-xl border border-[#008f8b] px-6 py-3 text-center font-bold text-[#008f8b]"
                  href={buildWhatsAppUrl(whatsappMessages.hero)}
                >
                  Hablar por WhatsApp
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-600">Cotizar no genera ningún compromiso.</p>
            </div>
            <div className="relative">
              <Image
                priority
                src="/car-protection.svg"
                alt="Ilustración demo de auto protegido"
                width={900}
                height={620}
                className="w-full rounded-3xl"
              />
              <p className="mt-2 text-center text-xs text-slate-500">Imagen DEMO sustituible por material autorizado.</p>
            </div>
          </div>
        </section>

        <QuoteForm />

        <section id="coberturas" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h2 className="text-center text-3xl font-black">Encuentra una cobertura para cada necesidad</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Información demostrativa. Las coberturas finales dependen de las condiciones de la póliza contratada.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {coverages.map((coverage) => (
              <article className="rounded-2xl border bg-white p-6 shadow-sm" key={coverage.name}>
                <h3 className="rounded-xl bg-[#b0007a] py-3 text-center text-white">{coverage.name}</h3>
                <ul className="mt-5 space-y-3">
                  {coverage.items.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <Check className="shrink-0 text-[#008f8b]" size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center">
            <a
              className="focus-ring rounded-xl border border-[#b0007a] px-6 py-3 font-bold text-[#b0007a]"
              href={buildWhatsAppUrl(whatsappMessages.coverage)}
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
                <article key={title} className="rounded-2xl bg-white p-6">
                  <Icon className="mb-4 text-[#b0007a]" />
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Orientación clara para revisar alternativas según tu vehículo y necesidades.
                  </p>
                </article>
              ))}
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
                  <MapPin className="text-[#008f8b]" size={18} />
                  {area}
                </span>
              ))}
            </div>
            <a className="focus-ring mt-6 inline-block rounded-xl bg-[#008f8b] px-5 py-3 font-bold text-white" href="#contacto">
              Solicitar asesoría
            </a>
          </div>
          <div>
            <h2 className="text-3xl font-black">Cotizar tu seguro es muy sencillo</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {processSteps.map((step, index) => (
                <article key={step} className="rounded-2xl border p-5">
                  <strong className="text-[#b0007a]">0{index + 1}</strong>
                  <h3 className="mt-2 font-black">{step}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black">Lo que dicen nuestros clientes</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((testimonialSlot) => (
                <article key={testimonialSlot} className="rounded-2xl border bg-white p-6">
                  <p className="font-bold text-slate-500">Espacio reservado para testimonio verificado</p>
                  <p className="mt-5 text-sm text-slate-500">
                    Nombre, ubicación, texto y fecha se agregarán cuando exista autorización y verificación.
                  </p>
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

        <section className="bg-[#b0007a] px-4 py-12 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <Car size={48} />
              <h2 className="mt-3 text-3xl font-black">Protege tu auto hoy</h2>
              <p className="mt-2 max-w-2xl">
                Solicita una cotización y recibe atención personalizada para encontrar una opción adecuada para tu vehículo.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="focus-ring rounded-xl bg-white px-6 py-3 font-bold text-[#b0007a]" href="#cotizador">
                Cotizar mi seguro
              </a>
              <a
                className="focus-ring rounded-xl border border-white px-6 py-3 font-bold"
                href={buildWhatsAppUrl(whatsappMessages.general)}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <LeadForm />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-[#351044] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
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
          <a className="block" href="#coberturas">Coberturas</a>
          <a className="block" href="#faq">Preguntas frecuentes</a>
          <a className="block" href="#cotizador">Cotizar</a>
          <a className="block" href="#contacto">Contacto</a>
        </div>
        <div>
          <h2 className="font-bold">CONTACTO</h2>
          <p className="mt-3">{siteConfig.phone}</p>
          <p>{siteConfig.whatsapp.display}</p>
          <p>{siteConfig.email}</p>
          <p>{siteConfig.businessHours}</p>
        </div>
        <div>
          <h2 className="font-bold">LEGAL</h2>
          <a className="mt-3 block" href="/aviso-privacidad">Aviso de privacidad</a>
          <a className="block" href="/terminos">Términos y condiciones</a>
          <a className="block" href="#">Política de cookies</a>
          <a className="mt-5 block text-white/80" href={siteConfig.officialQualitasUrl}>Sitio oficial Quálitas</a>
        </div>
      </div>
    </footer>
  );
}
