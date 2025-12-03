<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instrucciones del Proyecto: Sistema de Gestión de Gimnasio (GMS) White-Label

## Objetivo
Desarrollar un GMS white-label en Next.js Full-Stack, priorizando el control financiero y la retención de socios.

## Stack Tecnológico
- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Autenticación:** Auth.js (NextAuth)

## Estructura de Carpetas
- `src/app`: Rutas de la aplicación.
- `src/app/admin`: Rutas protegidas para la administración.
- `src/components`: Componentes reutilizables.
- `src/lib`: Utilidades y configuración (Prisma client, etc.).
- `src/actions`: Server Actions para mutaciones.

## Convenciones
- Usar Server Actions para todas las mutaciones de datos.
- Usar Route Handlers solo para reportes complejos o endpoints externos.
- Mantener la lógica de negocio separada de la UI.
- Tipado estricto con TypeScript.
