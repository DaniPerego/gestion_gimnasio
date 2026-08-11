import { MetadataRoute } from 'next';
import { getConfiguracion } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getConfiguracion();
  
  const timestamp = Date.now();
  
  return {
    name: config?.nombreGimnasio || 'Sistema de Gestión de Gimnasio',
    short_name: config?.nombreGimnasio?.substring(0, 12) || 'Gimnasio',
    description: `Sistema de administración para ${config?.nombreGimnasio || 'gimnasio'}`,
    start_url: `/?v=${timestamp}`,
    display: 'standalone',
    background_color: config?.colorSecundario || '#ffffff',
    theme_color: config?.colorPrimario || '#DC2626',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `/api/icon?size=192&v=${timestamp}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/api/icon?size=512&v=${timestamp}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: `/api/icon?size=192&v=${timestamp}`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: `/api/icon?size=512&v=${timestamp}`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    screenshots: []
  };
}
