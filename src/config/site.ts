export const siteConfig = {
  businessName: 'Quálitas Cuautitlán Romero Rubio',
  relationshipLabel: 'Agente autorizado',
  agentName: 'DEMO - Nombre del agente por confirmar',
  agentLicense: 'DEMO - Cédula o clave de agente por confirmar',
  phone: '55 8566 7261',
  phoneHref: 'tel:+525585667261',
  whatsapp: { number: '525585667261', display: '55 8566 7261' },
  email: 'romerorubio@qualitas.com.mx',
  address: '',
  businessHours: '',
  serviceAreas: ['Cuautitlán','Cuautitlán Izcalli','Cuautitlán Romero Rubio','Tultepec','Tepotzotlán','Melchor Ocampo'],
  socialLinks: { facebook: '#', instagram: '#', whatsapp: '#' },
  officialQualitasUrl: 'https://www.qualitas.com.mx/',
  officeMapUrl: ['https://maps.app.goo.gl', 'nhkbJM6dAtJofCuh6'].join('/'),
  url: 'https://qualitas-tultitlan-lemon.vercel.app',
};
export const whatsappMessages = {
  hero: 'Hola, quiero información sobre un seguro Quálitas.',
  quote: (details: string) => `Hola, quiero solicitar seguimiento para una cotización de seguro de auto.\n${details}`,
  coverage: 'Hola, quiero conocer las opciones de cobertura y confirmar por escrito qué riesgos están incluidos, sumas aseguradas, deducibles, requisitos y exclusiones aplicables a mi vehículo.',
  general: 'Hola, quiero asesoría sobre un seguro de auto Quálitas en Cuautitlán Romero Rubio. Me gustaría revisar las coberturas disponibles, sus límites, deducibles y exclusiones antes de contratar.',
};
