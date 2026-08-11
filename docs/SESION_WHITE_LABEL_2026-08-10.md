# Sesión: Creación de White-Label - 10/08/2026

## Objetivo
Crear una copia completa del proyecto `administracion_gimnasio_bendito-cross` adaptada como plantilla white-label para futuros clientes, desplegable en Vercel sin necesidad de PostgreSQL externa.

---

## Análisis Inicial

### Proyecto Original
- **Ubicación**: `C:\Users\Usuario\Documents\PROYECTOS\administracion_gimnasio_bendito-cross`
- **Stack**: Next.js 16, PostgreSQL, Prisma, NextAuth v5, Tailwind CSS v4
- **Base de datos**: PostgreSQL (Prisma Data Platform)

### Repo White-Label existente (GitHub)
- **URL**: https://github.com/DaniPerego/gestion-gimnasio-white-label
- **Estado**: Copia MUY desactualizada del original

### Diferencias encontradas en el repo existente
| Componente | Estado |
|------------|--------|
| Base de datos | SQLite (parcial) |
| Modelo CuentaCorriente | FALTABA |
| Modelo MovimientoCuentaCorriente | FALTABA |
| Campo tipoPago en Transaccion | FALTABA |
| Campo modalidad en Asistencia | FALTABA |
| Módulo Cuenta Corriente (UI) | FALTABA |
| Módulo Reportes (UI) | FALTABA |
| API routes (asistencias/hoy, reportes, icon) | FALTABAN |
| PWA dinámica (manifest, icon, apple-icon) | FALTABA |
| Dependencia html2canvas | FALTABA |

---

## Estrategia Elegida
**Clonar el proyecto original completo + adaptar para SQLite** (en vez de copiar archivos faltantes al repo viejo).

---

## Cambios Realizados

### 1. Clonación del Proyecto
```bash
# Copia completa excluyendo node_modules, .next, .git
robocopy "administracion_gimnasio_bendito-cross" "gestion-gimnasio-white-label" /E /XD node_modules .next .git
```

### 2. Adaptación de Prisma Schema (PostgreSQL → SQLite)

**Archivo**: `prisma/schema.prisma`

```diff
- datasource db {
-   provider  = "postgresql"
-   url       = env("PRISMA_DATABASE_URL")
-   directUrl = env("POSTGRES_URL")
- }
+ datasource db {
+   provider = "sqlite"
+   url      = env("DATABASE_URL")
+ }

- saldoDeuda   Decimal @default(0) @db.Decimal(10, 2)
- saldoCredito Decimal @default(0) @db.Decimal(10, 2)
+ saldoDeuda   Decimal @default(0)
+ saldoCredito Decimal @default(0)

- monto Decimal @db.Decimal(10, 2)
+ monto Decimal
```

### 3. Variables de Entorno

**Archivo nuevo**: `.env`
```
DATABASE_URL="file:./dev.db"
```

**Archivo nuevo**: `.env.example`
```
DATABASE_URL="file:./dev.db"
# Para producción: DATABASE_URL="postgres://..."
```

### 4. Eliminación de `mode: 'insensitive'`
SQLite no soporta búsqueda case-insensitive con Prisma. Se eliminaron 18 ocurrencias en:

| Archivo | Ocurrencias |
|---------|-------------|
| `src/lib/data-socios.ts` | 4 |
| `src/lib/data-transacciones.ts` | 6 |
| `src/lib/data-usuarios.ts` | 4 |
| `src/lib/data-suscripciones.ts` | 6 |
| `src/lib/data-cuenta-corriente.ts` | 6 |
| `src/lib/data-asistencias.ts` | 6 |

> **Nota**: SQLite ya es case-insensitive por defecto para caracteres ASCII.

### 5. Fix: `cancelSuscripcion` Return Type

**Archivo**: `src/lib/actions-suscripciones.ts`

```diff
  export async function cancelSuscripcion(id: string) {
    try {
      await prisma.suscripcion.update({ ... });
      revalidatePath('/admin/suscripciones');
    } catch (error) {
      console.error('Database Error:', error);
-     return { message: 'Error...' };
+     throw new Error('Error de base de datos...');
    }
  }
```

### 6. Limpieza de Archivos

**Eliminados de `prisma/`**:
- `filtro-modalidad-profesor.tsx` (stray file)
- `page.tsx` (stray file)
- `tabla-asistencias-profesor.tsx` (stray file)
- `migrations/20251213040327_add_socio_details/` (PostgreSQL)
- `migrations/20260220120000_add_tipo_pago_transaccion/` (PostgreSQL)

**Eliminados de raíz**:
- `ACTUALIZAR_PWA.md`
- `check-socios.ts`
- `gimnasio-backup.json`
- `tsconfig.tsbuildinfo`
- `next-env.d.ts`

### 7. Migración SQLite

```bash
npx prisma migrate dev --name init
```

**Resultado**: `prisma/migrations/20260811011804_init/migration.sql`

### 8. Seed Inicial

```bash
npx prisma db seed
```

**Usuario creado**:
- Email: `admin@gimnasio.com`
- Contraseña: `admin123` (hasheada con bcrypt)
- Rol: `ADMIN`

### 9. Actualización de `.gitignore`

```diff
+ # sqlite
+ *.db
+ *.db-journal

# env files (corregido para permitir .env.example)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 10. README Actualizado
Documentación completa para white-label con:
- Instrucciones de instalación
- Variables de entorno
- Estructura del proyecto
- Credenciales por defecto
- Guía de despliegue en Vercel

---

## Resultado del Build

```
✓ Compiled successfully
✓ 28 rutas generadas

Rutas estáticas: /, /_not-found, /login
Rutas dinámicas: /admin/*, /api/*, /kiosco, /manifest, /icon, /apple-icon
```

---

## Commits Realizados

```
b895bcf feat: adapt project as white-label with SQLite
24ce7ba docs: update README for white-label version
```

**Push exitoso a**: https://github.com/DaniPerego/gestion-gimnasio-white-label

---

## Archivos Modificados (Resumen)

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | PostgreSQL → SQLite |
| `.env` | DATABASE_URL para SQLite |
| `.env.example` | Nuevo (referencia) |
| `.gitignore` | Agregado *.db |
| `README.md` | Documentación white-label |
| `src/lib/data-socios.ts` | Quitado mode insensitive |
| `src/lib/data-transacciones.ts` | Quitado mode insensitive |
| `src/lib/data-usuarios.ts` | Quitado mode insensitive |
| `src/lib/data-suscripciones.ts` | Quitado mode insensitive |
| `src/lib/data-cuenta-corriente.ts` | Quitado mode insensitive |
| `src/lib/data-asistencias.ts` | Quitado mode insensitive |
| `src/lib/actions-suscripciones.ts` | Fix return type |

---

## Lecciones Aprendidas

1. **SQLite + Prisma**: No soporta `mode: 'insensitive'`, `@db.Decimal()`, ni enums nativos
2. **Server Actions**: El tipo de retorno de funciones que se usan como `form action` debe ser `void` o `Promise<void>`
3. **Git remote**: Siempre verificar el remote antes de `git push --force`
4. **Copiar proyectos**: Usar `robocopy` en vez de `Copy-Item` para proyectos grandes (evita timeouts)

---

## Para el Próximo Paso

- [ ] Deploy en Vercel
- [ ] Probar login y funcionalidad completa en producción
- [ ] Configurar PostgreSQL para producción (Prisma Data Platform, Neon, o Supabase)
- [ ] Personalizar branding en `/admin/configuracion` para cada cliente
