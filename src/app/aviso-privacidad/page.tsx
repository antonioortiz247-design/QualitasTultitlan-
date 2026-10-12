import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Aviso de privacidad | Quálitas Cuautitlán',
  description: 'Información provisional sobre privacidad y contacto del sitio.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:py-16">
      <a className="focus-ring rounded-sm text-sm font-semibold text-qualitas-purple underline" href="/">Volver al inicio</a>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Aviso de privacidad</h1>
      <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Aviso provisional pendiente de validación legal. Antes de habilitar la captación de datos personales, el responsable del sitio debe completar y aprobar el aviso integral.
      </p>
      <h2 className="mt-8 text-xl font-bold">Uso actual de este sitio</h2>
      <p className="mt-3 leading-7 text-slate-700">Los formularios de esta versión son demostrativos y no transmiten ni almacenan sus datos. Si decide abrir WhatsApp o su aplicación de correo, usted revisa y envía el mensaje por cuenta propia a través de ese servicio.</p>
      <h2 className="mt-8 text-xl font-bold">Contacto</h2>
      <p className="mt-3 leading-7 text-slate-700">Para consultas relacionadas con este sitio, puede escribir a <a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.</p>
      <p className="mt-6 leading-7 text-slate-700">Pendiente de completar antes de producción: identidad y domicilio del responsable, finalidades del tratamiento, opciones para limitar el uso o divulgación, procedimiento para ejercer derechos ARCO, transferencias aplicables y mecanismo para comunicar cambios al aviso.</p>
    </main>
  );
}
