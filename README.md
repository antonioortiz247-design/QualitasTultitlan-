# Quálitas Cuautitlán

Landing page de captación y orientación sobre seguros de auto, construida con Next.js 14, React 18, TypeScript y Tailwind CSS 3.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build`

## Configuración de contacto

Los datos de contacto y mensajes prellenados se centralizan en `src/config/site.ts`. No duplicar el número de WhatsApp en componentes.

## Estado de integraciones y activos

- El cotizador y el formulario de contacto son demostrativos: no guardan solicitudes en base de datos ni envían datos a un CRM.
- El cotizador permite preparar un mensaje para que la persona lo revise y lo envíe manualmente por WhatsApp.
- Los eventos de `src/lib/analytics.ts` solo escriben en consola durante desarrollo; no existe una integración de analítica externa configurada.
- No hay integración con Supabase comprobada en esta versión.
- El aviso de privacidad se marca como provisional porque faltan datos del responsable y revisión legal. Completarlo antes de activar captación real de datos personales.
- No se encontró un logotipo oficial autorizado dentro de los activos inspeccionados. El encabezado usa tipografía, sin dibujar una Q sustitutiva.
- La imagen actual del hero es una ilustración SVG existente; sustituirla por fotografía automotriz autorizada antes de dar por completada la dirección de arte.

## Despliegue

Compatible con el flujo de despliegue existente en Vercel. No se ejecutó un despliegue desde esta rama.
