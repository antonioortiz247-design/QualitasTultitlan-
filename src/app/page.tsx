import Image from 'next/image';
import {
  Car,
  Check,
  CircleDollarSign,
  FileText,
  HeartPulse,
  KeyRound,
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
                  href={buildWhatsAppUrl(whatsappMessages.hero)}
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

        <section id="zona-atencion" className="overflow-hidden bg-slate-50 px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-qualitas-aqua">Estamos cerca de ti</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-qualitas-purple sm:text-4xl">Nuestra zona de atención</h2>
              <p className="mt-4 text-slate-600">
                Atención para Cuautitlán Romero Rubio y municipios de la zona norte del Valle de México. Explora el mapa y ubica las localidades cercanas.
              </p>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  title="Mapa de Cuautitlán y municipios cercanos en el Estado de México"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-99.29%2C19.59%2C-98.98%2C19.84&layer=mapnik&marker=19.673%2C-99.181"
                  className="h-[360px] w-full sm:h-[440px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-500">Mapa interactivo · OpenStreetMap</span>
                  <a className="font-bold text-qualitas-purple underline underline-offset-4" href="https://www.openstreetmap.org/#map=12/19.673/-99.181" target="_blank" rel="noreferrer">
                    Abrir mapa completo
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#941B80]/10 text-qualitas-purple">
                    <MapPin size={25} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-qualitas-purple">Municipios de la zona</h3>
                    <p className="mt-1 text-sm text-slate-500">Alrededores y localidades cercanas</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Cuautitlán', 'Cuautitlán Izcalli', 'Tepotzotlán', 'Teoloyucan', 'Zumpango', 'Melchor Ocampo', 'Tultepec', 'Tultitlán', 'Nextlalpan', 'Coacalco de Berriozábal'].map((area) => (
                    <span key={area} className={area === 'Cuautitlán' ? 'rounded-full bg-qualitas-purple px-3 py-2 text-sm font-bold text-white' : 'rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700'}>
                      {area}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-slate-600">
                  La lista combina municipios colindantes y localidades cercanas donde podemos orientar solicitudes. La atención y disponibilidad del servicio se confirman de acuerdo con cada solicitud.
                </p>
                <a className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition hover:brightness-90" href={buildWhatsAppUrl('Hola, estoy en uno de los municipios cercanos a Cuautitlán y quiero consultar opciones de seguro de auto.')}>
                  <MapPin size={18} aria-hidden="true" /> Consultar por WhatsApp
                </a>
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
                <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-[#941B80] via-[#76206f] to-[#0096AE] p-8 text-center text-white">
                  <div className="absolute -right-10 -top-10 size-48 rounded-full border border-white/20" />
                  <div className="absolute -bottom-16 -left-8 size-56 rounded-full border border-white/20" />
                  <div className="relative">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm">
                      <Car size={32} aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-2xl font-black">Activaciones y eventos</h3>
                    <p className="mt-2 text-sm text-white/90">Galería de jornadas, dinámicas y presencia de marca</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-600">Aquí compartiremos fotografías de nuestras actividades en puntos de encuentro, eventos locales y acciones de orientación para automovilistas.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-qualitas-purple"><MapPin size={16} aria-hidden="true" /> Cuautitlán y municipios cercanos</span>
                </div>
              </article>

              <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0096AE] via-[#087d91] to-[#941B80] p-8 text-center text-white">
                  <div className="absolute -right-10 -top-10 size-48 rounded-full border border-white/20" />
                  <div className="absolute -bottom-16 -left-8 size-56 rounded-full border border-white/20" />
                  <div className="relative">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm">
                      <UserRound size={32} aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-2xl font-black">Socios comerciales</h3>
                    <p className="mt-2 text-sm text-white/90">Negocios, colaboradores y alianzas locales</p>
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
              <a className="focus-ring mt-4 inline-flex rounded-xl bg-qualitas-purple px-5 py-3 font-bold text-white transition hover:brightness-90" href={buildWhatsAppUrl('Hola, me interesa conocer las próximas activaciones y las opciones para colaborar como socio comercial.')}>
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
          <a className="block" href="#coberturas">Coberturas</a>
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
