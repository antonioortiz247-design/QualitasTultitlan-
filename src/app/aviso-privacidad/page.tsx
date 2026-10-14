import { siteConfig } from '@/config/site';

export const metadata = {
  title: 'Aviso de privacidad | Quálitas Cuautitlán',
  description: 'Información sobre el tratamiento de datos en las solicitudes de cotización.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:py-16">
      <a className="focus-ring rounded-sm text-sm font-semibold text-qualitas-purple underline" href="/">Volver al inicio</a>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Aviso de privacidad</h1>
      <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Aviso provisional pendiente de validación legal. Este texto no sustituye un aviso de privacidad integral y debe completarse y aprobarse por el responsable del tratamiento antes de utilizar el formulario públicamente.
      </p>
      <h2 className="mt-8 text-xl font-bold">Datos que solicita el formulario</h2>
      <p className="mt-3 leading-7 text-slate-700">
        El formulario de solicitud de cotización pide nombre, teléfono, correo electrónico, código postal, edad del conductor, uso del vehículo, marca, modelo, versión, año y, cuando corresponde, tipo y claves de identificación del vehículo. También puede registrar parámetros técnicos de la solicitud, como el origen de la visita.
      </p>
      <h2 className="mt-8 text-xl font-bold">Envío y almacenamiento</h2>
      <p className="mt-3 leading-7 text-slate-700">
        Al enviar el formulario, los datos se transmiten al servidor de este sitio. Cuando el servicio de registro está configurado y disponible, la solicitud se guarda en la base de datos conectada al sitio para seguimiento de la cotización. Si se abre WhatsApp, los datos incluidos en el mensaje se comparten con ese servicio únicamente cuando la persona decide enviarlo.
      </p>
      <h2 className="mt-8 text-xl font-bold">Información que debe completarse</h2>
      <p className="mt-3 leading-7 text-slate-700">
        Antes de captar datos personales de forma pública, el responsable debe validar y publicar el aviso integral con su identidad y domicilio, las finalidades primarias y secundarias, las opciones para limitar el uso o divulgación, el mecanismo para ejercer derechos ARCO, las transferencias que correspondan, los plazos o criterios de conservación y el procedimiento para comunicar cambios al aviso. Esta información no se presume ni se completa con datos no verificados.
      </p>
      <h2 className="mt-8 text-xl font-bold">Contacto del sitio</h2>
      <p className="mt-3 leading-7 text-slate-700">
        Para consultas generales sobre el sitio, puede escribir a <a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Este contacto no sustituye la identificación legal del responsable del tratamiento que debe incorporarse al aviso integral.
      </p>
    </main>
  );
}
