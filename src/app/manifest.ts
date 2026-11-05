import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Quálitas Cuautitlán Romero Rubio',
    short_name: 'Quálitas',
    description: 'Sitio y herramientas de atención Quálitas Cuautitlán Romero Rubio.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f8fb',
    theme_color: '#941B80',
    icons: [
      { src: '/Q-morado.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/Q-morado.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/Q-morado.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
