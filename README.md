# Gestión de Gimnasio - White Label

Sistema de gestión de gimnasios multi-tenant, listo para desplegar como instancia separada para cada cliente.

## Características

- **Multi-tenant por diseño**: Cada instancia tiene su propia base de datos SQLite (desarrollo) o PostgreSQL (producción)
- **Configuración white-label**: Nombre del gimnasio, colores, logo y fondo configurables desde `/admin/configuracion`
- **PWA completa**: Manifiesto e iconos dinámicos generados desde la configuración
- **Modo Kiosco**: Pantalla de check-in por DNI para tablets en la entrada
- **Módulos completos**:
  - Socios (CRUD)
  - Planes de suscripción
  - Suscripciones con gestión de vencimientos
  - Transacciones y pagos con tickets
  - Asistencias con filtrado por modalidad
  - Cuenta corriente por socio
  - Reportes financieros
  - Gestión de usuarios con permisos granulares

## Stack

- **Framework**: Next.js 16 (App Router)
- **Base de datos**: SQLite (dev) / PostgreSQL (producción)
- **ORM**: Prisma
- **Auth**: NextAuth v5
- **Estilos**: Tailwind CSS v4
- **Theme**: Dark/Light mode con next-themes

## Instalación

```bash
# Instalar dependencias
npm install

# Crear base de datos y datos iniciales
npx prisma migrate dev
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Para desarrollo local con SQLite (ya configurado):
```
DATABASE_URL="file:./dev.db"
```

Para producción en Vercel con PostgreSQL:
```
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
```

## Usuario por defecto

- **Email**: admin@gimnasio.com
- **Contraseña**: admin123

> ⚠️ Cambiar la contraseña después del primer login en producción.

## Despliegue en Vercel

1. Subir a un repositorio GitHub
2. Conectar el repositorio en Vercel
3. Configurar la variable de entorno `DATABASE_URL` con tu PostgreSQL (Prisma Data Platform, Neon, Supabase, etc.)
4. Vercel ejecutará `prisma migrate deploy` automáticamente

## Estructura del proyecto

```
src/
├── app/                    # Rutas Next.js App Router
│   ├── admin/              # Panel de administración
│   ├── api/                # API routes
│   ├── kiosco/             # Modo kiosco (check-in)
│   └── login/              # Autenticación
├── components/             # Componentes React
│   ├── admin/              # Navegación
│   ├── socios/             # CRUD socios
│   ├── planes/             # CRUD planes
│   ├── suscripciones/      # CRUD suscripciones
│   ├── transacciones/      # CRUD transacciones
│   ├── asistencias/        # Control de asistencia
│   ├── cuenta-corriente/   # Cuenta corriente
│   ├── reportes/           # Reportes financieros
│   ├── configuracion/      # Configuración white-label
│   └── ui/                 # Componentes genéricos
├── lib/                    # Utilidades y lógica
│   ├── data-*.ts           # Queries a base de datos
│   ├── actions-*.ts        # Server Actions
│   └── prisma.ts           # Cliente Prisma singleton
└── auth.ts                 # Configuración NextAuth
```

## Licencia

Proyecto privado - DaniPerego
