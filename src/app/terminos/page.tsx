import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Términos y condiciones | Quálitas Cuautitlán',
  description: 'Alcance informativo del sitio de orientación sobre seguros de auto.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:py-16">
      <a className="focus-ring rounded-sm text-sm font-semibold text-qualitas-purple underline" href="/">Volver al inicio</a>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Términos y condiciones</h1>
      <p className="mt-4 leading-7 text-slate-700">Este sitio ofrece información general y medios de contacto para solicitar orientación sobre seguros de automóvil. El contenido no constituye una cotización, oferta vinculante ni confirmación de cobertura.</p>
      <h2 className="mt-8 text-xl font-bold">Cotizaciones y cobertura</h2>
      <p className="mt-3 leading-7 text-slate-700">Las primas, coberturas, exclusiones, sumas aseguradas, deducibles, requisitos y condiciones deben confirmarse mediante la cotización formal y la documentación de la póliza emitida por la aseguradora.</p>
      <h2 className="mt-8 text-xl font-bold">Contacto</h2>
      <p className="mt-3 leading-7 text-slate-700">Puede contactar al sitio en <a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. La identidad y los datos profesionales del agente que estén pendientes de confirmación no se presentan como información validada.</p>
    </main>
  );
}
