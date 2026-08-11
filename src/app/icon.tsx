import { ImageResponse } from 'next/og';
import { getConfiguracion } from '@/lib/data';

export const runtime = 'edge';

export const size = {
  width: 192,
  height: 192,
};

export const contentType = 'image/png';

export default async function Icon() {
  const config = await getConfiguracion();
  const logoUrl = config?.fondoUrl;
  const primaryColor = config?.colorPrimario || '#000000';
  const gymName = config?.nombreGimnasio || 'GYM';

  return new ImageResponse(
    (
      <div
        style={{
          background: primaryColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            width="160"
            height="160"
            style={{
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
            <div style={{ fontSize: 80, fontWeight: 'bold' }}>💪</div>
            <div style={{ fontSize: 28, marginTop: 10, fontWeight: 'bold' }}>{gymName.substring(0, 10)}</div>
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
