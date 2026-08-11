# Guía: Convertir Next.js en PWA Responsive e Instalable

Esta guía te muestra cómo hacer que tu aplicación Next.js sea responsive en móviles y se pueda instalar como una app nativa.

## 📱 Parte 1: Hacer la App Responsive

### 1.1 Configurar Viewport en Layout

Editá `src/app/layout.tsx` y agregá viewport en metadata:

```typescript
export const metadata: Metadata = {
  title: "Tu App",
  description: "Descripción de tu app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};
```

### 1.2 Usar Clases Responsive de Tailwind

Aplicá estas clases para hacer componentes adaptativos:

```typescript
// Padding responsive
className="px-2 md:px-4 lg:px-6"

// Texto responsive
className="text-xs md:text-sm lg:text-base"

// Margin responsive
className="mt-2 md:mt-4 lg:mt-8"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Flex responsive
className="flex flex-col md:flex-row"

// Ocultar en móvil
className="hidden md:block"

// Mostrar solo en móvil
className="block md:hidden"
```

### 1.3 Tablas Responsive

Para tablas, agregá scroll horizontal y oculta columnas en móvil:

```typescript
<div className="overflow-x-auto">
  <table className="w-full text-xs md:text-sm">
    <thead>
      <tr>
        <th className="px-2 md:px-4">Siempre visible</th>
        <th className="px-2 md:px-4 hidden md:table-cell">Solo desktop</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="px-2 md:px-4">
          {/* Contenido principal */}
          <div className="md:hidden text-xs">
            {/* Info que se oculta en desktop, va acá en móvil */}
          </div>
        </td>
        <td className="px-2 md:px-4 hidden md:table-cell">
          {/* Esta columna se oculta en móvil */}
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 1.4 Botones Touch-Friendly

Hacé botones más grandes para móviles:

```typescript
<button className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm 
                   active:bg-blue-600 transition-colors">
  Botón
</button>
```

## 🚀 Parte 2: Convertir en PWA (Instalable)

### 2.1 Actualizar Layout con Metadata PWA

Editá `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Tu App",
  description: "Descripción de tu app",
  manifest: "/manifest.json",
  themeColor: "#000000", // Color de tu marca
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tu App",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2.2 Crear manifest.json

Creá `public/manifest.json`:

```json
{
  "name": "Nombre Completo de Tu App",
  "short_name": "App",
  "description": "Descripción de tu app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 2.3 Generar Iconos Dinámicamente con Next.js

**Opción A: Iconos Dinámicos con Emoji (Más fácil)**

Creá `src/app/icon.tsx`:

```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000', // Tu color de marca
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '32px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 80, fontWeight: 'bold' }}>💪</div>
          <div style={{ fontSize: 32, marginTop: 10 }}>APP</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
```

Creá `src/app/apple-icon.tsx` (igual pero tamaño 180x180).

**Opción B: Usar Imágenes PNG**

Si preferís usar imágenes:
1. Creá iconos de 192x192 y 512x512 píxeles
2. Guardalos en `public/` como `icon-192x192.png` y `icon-512x512.png`

### 2.4 Configurar Service Worker (Opcional pero Recomendado)

Instalá next-pwa:

```bash
npm install next-pwa
```

Editá `next.config.ts`:

```typescript
import withPWA from 'next-pwa';

const nextConfig = {
  // Tu configuración existente
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
```

## 📲 Cómo Instalar la APP en Móviles

### Android (Chrome):
1. Abrí la app en Chrome
2. Tocá el menú (⋮)
3. Seleccioná **"Agregar a pantalla de inicio"**
4. Listo! Aparece como app nativa

### iPhone (Safari):
1. Abrí la app en Safari (NO Chrome)
2. Tocá el botón compartir (□↑)
3. Seleccioná **"Agregar a inicio"**
4. Confirmá

## ✅ Checklist Final

- [ ] Viewport configurado en layout
- [ ] Manifest.json creado
- [ ] Iconos generados (dinámicos o estáticos)
- [ ] Meta tags de PWA en layout
- [ ] Componentes con clases responsive (sm, md, lg)
- [ ] Tablas con overflow-x-auto
- [ ] Botones touch-friendly (tamaño adecuado)
- [ ] Probado en móvil real
- [ ] Instalación como PWA funcional

## 🎨 Tips Extra

### Breakpoints de Tailwind:
- `sm`: ≥ 640px (tablets pequeñas)
- `md`: ≥ 768px (tablets)
- `lg`: ≥ 1024px (laptops)
- `xl`: ≥ 1280px (desktops)
- `2xl`: ≥ 1536px (pantallas grandes)

### Tamaños Recomendados:
- **Botones móvil**: mínimo 44x44px (área táctil)
- **Texto móvil**: 14-16px mínimo para lectura
- **Padding móvil**: 8-16px en los lados
- **Iconos app**: 192x192 y 512x512px

### Probar Responsive:
1. Chrome DevTools (F12)
2. Click en ícono móvil (Ctrl+Shift+M)
3. Probá diferentes dispositivos
4. Verificá que todo se vea bien

## 🔍 Verificar PWA

1. Abrí Chrome DevTools
2. Andá a la pestaña "Lighthouse"
3. Seleccioná "Progressive Web App"
4. Click en "Generate report"
5. Debe dar 100% o cerca

---

**Listo!** Tu app ahora es responsive y se puede instalar como una aplicación nativa en cualquier dispositivo.
