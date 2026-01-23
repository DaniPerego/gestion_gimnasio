# Implementación del Sistema de Cuenta Corriente

## 📋 Resumen
Sistema completo de gestión de Cuenta Corriente para gimnasios que permite:
- Registrar deudas y créditos de socios
- Aplicar pagos automáticamente desde transacciones
- Gestionar saldos (deuda - crédito = saldo neto)
- Historial completo de movimientos

---

## 🗄️ 1. Base de Datos (Prisma Schema)

### Modelos a agregar en `prisma/schema.prisma`

```prisma
model CuentaCorriente {
  id            String   @id @default(cuid())
  socioId       String   @unique
  socio         Socio    @relation(fields: [socioId], references: [id], onDelete: Cascade)
  saldoDeuda    Decimal  @default(0) @db.Decimal(10, 2)
  saldoCredito  Decimal  @default(0) @db.Decimal(10, 2)
  descripcion   String?
  estado        String   @default("ACTIVO") // ACTIVO, SALDADO, CERRADO
  movimientos   MovimientoCuentaCorriente[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model MovimientoCuentaCorriente {
  id                  String           @id @default(cuid())
  cuentaCorrienteId   String
  cuentaCorriente     CuentaCorriente  @relation(fields: [cuentaCorrienteId], references: [id], onDelete: Cascade)
  tipo                String           // DEUDA, CREDITO, PAGO, AJUSTE
  monto               Decimal          @db.Decimal(10, 2)
  descripcion         String
  transaccionId       String?          // Relación opcional con transacción
  transaccion         Transaccion?     @relation(fields: [transaccionId], references: [id])
  createdAt           DateTime         @default(now())

  @@index([cuentaCorrienteId])
}
```

### Actualizar modelo Socio

```prisma
model Socio {
  // ... campos existentes
  cuentaCorriente CuentaCorriente?
}
```

### Actualizar modelo Transaccion

```prisma
model Transaccion {
  // ... campos existentes
  movimientosCuentaCorriente MovimientoCuentaCorriente[]
}
```

### Migración

```bash
npx prisma migrate dev --name add_cuenta_corriente
# o
npx prisma db push
```

---

## ⚙️ 2. Server Actions

### Crear `src/lib/actions-cuenta-corriente.ts`

```typescript
'use server';

import { z } from 'zod';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';

// === SCHEMAS ===

const AbrirCuentaCorrienteSchema = z.object({
  socioId: z.string().min(1, 'El socio es requerido'),
  descripcion: z.string().optional().nullable(),
});

const RegistrarMovimientoSchema = z.object({
  cuentaCorrienteId: z.string().min(1, 'La cuenta corriente es requerida'),
  tipo: z.enum(['DEUDA', 'CREDITO', 'PAGO', 'AJUSTE']),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  transaccionId: z.string().optional(),
});

const CerrarCuentaCorrienteSchema = z.object({
  cuentaCorrienteId: z.string().min(1, 'La cuenta corriente es requerida'),
});

// === TYPES ===

type AbrirCuentaCorrienteState = {
  errors?: {
    socioId?: string[];
    descripcion?: string[];
  };
  message?: string;
  success?: boolean;
};

type RegistrarMovimientoState = {
  errors?: {
    cuentaCorrienteId?: string[];
    tipo?: string[];
    monto?: string[];
    descripcion?: string[];
  };
  message?: string;
  success?: boolean;
};

type CerrarCuentaCorrienteState = {
  errors?: {
    cuentaCorrienteId?: string[];
  };
  message?: string;
  success?: boolean;
};

// === ABRIR CUENTA CORRIENTE ===

export async function abrirCuentaCorriente(
  prevState: AbrirCuentaCorrienteState,
  formData: FormData
): Promise<AbrirCuentaCorrienteState> {
  const rawSocioId = formData.get('socioId');
  const rawDescripcion = formData.get('descripcion');
  
  const validatedFields = AbrirCuentaCorrienteSchema.safeParse({
    socioId: rawSocioId,
    descripcion: rawDescripcion,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación. Por favor revise los campos.',
      success: false,
    };
  }

  const { socioId, descripcion } = validatedFields.data;

  try {
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
    });

    if (!socio) {
      return {
        message: 'El socio no existe.',
        success: false,
      };
    }

    const cuentaExistente = await prisma.cuentaCorriente.findUnique({
      where: { socioId },
    });

    if (cuentaExistente) {
      return {
        message: 'El socio ya tiene una cuenta corriente activa.',
        success: false,
      };
    }

    await prisma.cuentaCorriente.create({
      data: {
        socioId,
        descripcion: descripcion || 'Cuenta corriente abierta',
        saldoDeuda: new Decimal(0),
        saldoCredito: new Decimal(0),
        estado: 'ACTIVO',
      },
    });

    revalidatePath(`/admin/cuenta-corriente/${socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return {
      message: 'Cuenta corriente abierta exitosamente.',
      success: true,
    };
  } catch (error) {
    console.error('Error al abrir cuenta corriente:', error);
    return {
      message: 'Error al abrir cuenta corriente.',
      success: false,
    };
  }
}

// === VERSIÓN DIRECTA (para uso desde cliente) ===

export async function abrirCuentaCorrienteDirecto(socioId: string, descripcion?: string) {
  try {
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
    });

    if (!socio) {
      throw new Error('El socio no existe.');
    }

    const cuentaExistente = await prisma.cuentaCorriente.findUnique({
      where: { socioId },
    });

    if (cuentaExistente) {
      throw new Error('El socio ya tiene una cuenta corriente activa.');
    }

    await prisma.cuentaCorriente.create({
      data: {
        socioId,
        descripcion: descripcion || 'Cuenta corriente abierta',
        saldoDeuda: new Decimal(0),
        saldoCredito: new Decimal(0),
        estado: 'ACTIVO',
      },
    });

    revalidatePath(`/admin/cuenta-corriente/${socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return { success: true };
  } catch (error) {
    console.error('Error al abrir cuenta corriente:', error);
    throw error;
  }
}

// === REGISTRAR MOVIMIENTO ===

export async function registrarMovimiento(
  prevState: RegistrarMovimientoState,
  formData: FormData
): Promise<RegistrarMovimientoState> {
  const validatedFields = RegistrarMovimientoSchema.safeParse({
    cuentaCorrienteId: formData.get('cuentaCorrienteId'),
    tipo: formData.get('tipo'),
    monto: formData.get('monto'),
    descripcion: formData.get('descripcion'),
    transaccionId: formData.get('transaccionId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación.',
      success: false,
    };
  }

  const { cuentaCorrienteId, tipo, monto, descripcion, transaccionId } = validatedFields.data;

  try {
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
    let nuevoSaldoCredito = cuentaCorriente.saldoCredito;

    // Calcular nuevos saldos según el tipo de movimiento
    switch (tipo) {
      case 'DEUDA':
        nuevoSaldoDeuda = nuevoSaldoDeuda.plus(monto);
        break;
      case 'CREDITO':
        nuevoSaldoCredito = nuevoSaldoCredito.plus(monto);
        break;
      case 'PAGO':
        // El pago reduce la deuda primero, luego el crédito
        let montoPendiente = new Decimal(monto);
        
        if (nuevoSaldoDeuda.greaterThan(0)) {
          if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoDeuda)) {
            montoPendiente = montoPendiente.minus(nuevoSaldoDeuda);
            nuevoSaldoDeuda = new Decimal(0);
          } else {
            nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoPendiente);
            montoPendiente = new Decimal(0);
          }
        }
        
        if (montoPendiente.greaterThan(0) && nuevoSaldoCredito.greaterThan(0)) {
          if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoCredito)) {
            montoPendiente = montoPendiente.minus(nuevoSaldoCredito);
            nuevoSaldoCredito = new Decimal(0);
          } else {
            nuevoSaldoCredito = nuevoSaldoCredito.minus(montoPendiente);
            montoPendiente = new Decimal(0);
          }
        }
        break;
      case 'AJUSTE':
        // Puedes definir tu lógica de ajuste
        break;
    }

    const nuevoEstado = nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
      ? 'SALDADO'
      : 'ACTIVO';

    await prisma.$transaction([
      prisma.movimientoCuentaCorriente.create({
        data: {
          cuentaCorrienteId,
          tipo,
          monto: new Decimal(monto),
          descripcion,
          transaccionId: transaccionId || null,
        },
      }),
      prisma.cuentaCorriente.update({
        where: { id: cuentaCorrienteId },
        data: {
          saldoDeuda: nuevoSaldoDeuda,
          saldoCredito: nuevoSaldoCredito,
          estado: nuevoEstado,
        },
      }),
    ]);

    revalidatePath(`/admin/cuenta-corriente/${cuentaCorriente.socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return {
      message: 'Movimiento registrado exitosamente.',
      success: true,
    };
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return {
      message: 'Error al registrar movimiento.',
      success: false,
    };
  }
}

// === CERRAR CUENTA CORRIENTE ===

export async function cerrarCuentaCorriente(
  prevState: CerrarCuentaCorrienteState,
  formData: FormData
): Promise<CerrarCuentaCorrienteState> {
  const validatedFields = CerrarCuentaCorrienteSchema.safeParse({
    cuentaCorrienteId: formData.get('cuentaCorrienteId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación.',
      success: false,
    };
  }

  const { cuentaCorrienteId } = validatedFields.data;

  try {
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    const saldoNeto = cuentaCorriente.saldoDeuda.minus(cuentaCorriente.saldoCredito);

    if (!saldoNeto.equals(0)) {
      return {
        message: 'No se puede cerrar una cuenta con saldo pendiente.',
        success: false,
      };
    }

    await prisma.cuentaCorriente.update({
      where: { id: cuentaCorrienteId },
      data: { estado: 'CERRADO' },
    });

    revalidatePath(`/admin/cuenta-corriente/${cuentaCorriente.socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return {
      message: 'Cuenta corriente cerrada exitosamente.',
      success: true,
    };
  } catch (error) {
    console.error('Error al cerrar cuenta corriente:', error);
    return {
      message: 'Error al cerrar cuenta corriente.',
      success: false,
    };
  }
}

// === OBTENER SALDO NETO ===

export async function obtenerSaldoNeto(cuentaCorrienteId: string): Promise<number> {
  try {
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) return 0;

    const saldoNeto = cuentaCorriente.saldoDeuda.minus(cuentaCorriente.saldoCredito);
    return saldoNeto.toNumber();
  } catch (error) {
    console.error('Error al obtener saldo neto:', error);
    return 0;
  }
}
```

---

## 📊 3. Data Layer (Queries)

### Crear `src/lib/data-cuenta-corriente.ts`

```typescript
import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 15;

/**
 * Obtener todos los socios con paginación y búsqueda
 */
export async function fetchSociosConCuentaCorriente(
  query: string,
  currentPage: number,
  filtro?: string
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const whereCondition: any = {
      activo: true,
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
        { dni: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Filtros adicionales
    if (filtro === 'con-cuenta') {
      whereCondition.cuentaCorriente = { isNot: null };
    } else if (filtro === 'sin-cuenta') {
      whereCondition.cuentaCorriente = null;
    } else if (filtro === 'con-deuda') {
      whereCondition.cuentaCorriente = {
        saldoDeuda: { gt: 0 },
      };
    } else if (filtro === 'con-credito') {
      whereCondition.cuentaCorriente = {
        saldoCredito: { gt: 0 },
      };
    }

    const socios = await prisma.socio.findMany({
      where: whereCondition,
      include: {
        cuentaCorriente: true,
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // Convertir Decimal a number
    return socios.map(s => ({
      ...s,
      cuentaCorriente: s.cuentaCorriente ? {
        ...s.cuentaCorriente,
        saldoDeuda: s.cuentaCorriente.saldoDeuda.toNumber(),
        saldoCredito: s.cuentaCorriente.saldoCredito.toNumber(),
      } : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socios con cuenta corriente.');
  }
}

/**
 * Contar páginas para paginación
 */
export async function fetchSociosCuentaCorrientePages(query: string, filtro?: string) {
  noStore();
  try {
    const whereCondition: any = {
      activo: true,
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
        { dni: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filtro === 'con-cuenta') {
      whereCondition.cuentaCorriente = { isNot: null };
    } else if (filtro === 'sin-cuenta') {
      whereCondition.cuentaCorriente = null;
    } else if (filtro === 'con-deuda') {
      whereCondition.cuentaCorriente = {
        saldoDeuda: { gt: 0 },
      };
    } else if (filtro === 'con-credito') {
      whereCondition.cuentaCorriente = {
        saldoCredito: { gt: 0 },
      };
    }

    const count = await prisma.socio.count({
      where: whereCondition,
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al contar socios.');
  }
}

/**
 * Obtener un socio con su cuenta corriente completa
 */
export async function fetchSocioConCuentaCorriente(socioId: string) {
  noStore();
  try {
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
      include: {
        cuentaCorriente: {
          include: {
            movimientos: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!socio) return null;

    // Convertir Decimal a number
    return {
      ...socio,
      cuentaCorriente: socio.cuentaCorriente ? {
        ...socio.cuentaCorriente,
        saldoDeuda: socio.cuentaCorriente.saldoDeuda.toNumber(),
        saldoCredito: socio.cuentaCorriente.saldoCredito.toNumber(),
        movimientos: socio.cuentaCorriente.movimientos.map(m => ({
          ...m,
          monto: m.monto.toNumber(),
        })),
      } : null,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socio con cuenta corriente.');
  }
}
```

---

## 🎨 4. Componentes UI

### 4.1 Tabla de Cuentas Corrientes

**Crear `src/components/cuenta-corriente/table.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { abrirCuentaCorrienteDirecto } from '@/lib/actions-cuenta-corriente';
import { useRouter } from 'next/navigation';

type Socio = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuentaCorriente: {
    id: string;
    saldoDeuda: number;
    saldoCredito: number;
    estado: string;
  } | null;
};

export default function CuentaCorrienteTable({ socios }: { socios: Socio[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAbrirCuenta = async (socioId: string, nombreCompleto: string) => {
    if (!confirm(`¿Abrir cuenta corriente para ${nombreCompleto}?`)) return;

    setLoading(socioId);
    try {
      await abrirCuentaCorrienteDirecto(socioId, 'Apertura de cuenta');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Error al abrir cuenta corriente');
    } finally {
      setLoading(null);
    }
  };

  const calcularSaldoNeto = (deuda: number, credito: number) => {
    return deuda - credito;
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          {/* Vista Desktop */}
          <table className="hidden min-w-full text-gray-900 dark:text-white md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Socio</th>
                <th scope="col" className="px-3 py-5 font-medium">DNI</th>
                <th scope="col" className="px-3 py-5 font-medium text-center">Estado</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Deuda</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Crédito</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Saldo Neto</th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {socios.map((socio) => {
                const tieneCuenta = socio.cuentaCorriente !== null;
                const saldoNeto = tieneCuenta
                  ? calcularSaldoNeto(socio.cuentaCorriente!.saldoDeuda, socio.cuentaCorriente!.saldoCredito)
                  : 0;

                return (
                  <tr key={socio.id} className="w-full border-b dark:border-gray-600 py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <p className="font-medium">{socio.apellido}, {socio.nombre}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{socio.dni}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-center">
                      {tieneCuenta ? (
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          socio.cuentaCorriente!.estado === 'ACTIVO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {socio.cuentaCorriente!.estado}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ${socio.cuentaCorriente!.saldoDeuda.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ${socio.cuentaCorriente!.saldoCredito.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className={`font-bold ${
                          saldoNeto > 0 ? 'text-red-600 dark:text-red-400'
                            : saldoNeto < 0 ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          ${Math.abs(saldoNeto).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-2">
                        {tieneCuenta ? (
                          <Link
                            href={`/admin/cuenta-corriente/${socio.id}`}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Gestionar
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleAbrirCuenta(socio.id, `${socio.nombre} ${socio.apellido}`)}
                            disabled={loading === socio.id}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 disabled:bg-gray-400"
                          >
                            {loading === socio.id ? '...' : 'Abrir Cuenta'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### 4.2 Gestor de Movimientos (Manager)

**Crear `src/components/cuenta-corriente/manager.tsx`** - Ver código completo en el proyecto, es un componente grande con formulario para registrar movimientos, historial, y acciones.

---

## 📄 5. Páginas

### 5.1 Página Principal de Cuenta Corriente

**Crear `src/app/admin/cuenta-corriente/page.tsx`**

```typescript
import { fetchSociosConCuentaCorriente, fetchSociosCuentaCorrientePages } from '@/lib/data-cuenta-corriente';
import Search from '@/components/ui/search';
import StatusFilter from '@/components/ui/status-filter';
import Pagination from '@/components/pagination';
import CuentaCorrienteTable from '@/components/cuenta-corriente/table';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filtro?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const filtro = params?.filtro || '';
  
  const socios = await fetchSociosConCuentaCorriente(query, currentPage, filtro);
  const totalPages = await fetchSociosCuentaCorrientePages(query, filtro);

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cuenta Corriente</h1>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Gestiona deudas y créditos de manera ágil:</strong> Busca un socio, abre su cuenta corriente 
          y registra movimientos. Los pagos se aplican automáticamente desde las transacciones.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        <div className="flex flex-1 gap-2">
          <Search placeholder="Buscar socio por nombre, apellido o DNI..." />
          <StatusFilter 
            filterKey="filtro" 
            options={[
              { value: 'con-cuenta', label: 'Con cuenta' },
              { value: 'sin-cuenta', label: 'Sin cuenta' },
              { value: 'con-deuda', label: 'Con deuda' },
              { value: 'con-credito', label: 'Con crédito' },
            ]}
            placeholder="Todos"
          />
        </div>
      </div>

      <Suspense key={query + currentPage + filtro} fallback={<div className="mt-4 text-gray-500">Cargando...</div>}>
        <CuentaCorrienteTable socios={socios} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
```

### 5.2 Página de Gestión Individual

**Crear `src/app/admin/cuenta-corriente/[id]/page.tsx`**

```typescript
import { fetchSocioConCuentaCorriente } from '@/lib/data-cuenta-corriente';
import CuentaCorrienteManager from '@/components/cuenta-corriente/manager';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = await fetchSocioConCuentaCorriente(id);

  if (!socio) {
    notFound();
  }

  return (
    <main>
      <CuentaCorrienteManager socio={socio} />
    </main>
  );
}
```

---

## 🔗 6. Integración con Transacciones

### 6.1 Actualizar Schema de Transacciones

En `src/lib/actions-transacciones.ts`, agregar campos al schema:

```typescript
const FormSchema = z.object({
  // ... campos existentes
  incluirCuentaCorriente: z.boolean().optional(),
  montoCuentaCorriente: z.coerce.number().optional(),
  cuentaCorrienteId: z.string().optional(),
});
```

### 6.2 Modificar la creación de transacciones

```typescript
export async function createTransaccion(prevState: unknown, formData: FormData) {
  // ... validación

  const { 
    suscripcionId, 
    monto, 
    metodoPago, 
    notas, 
    incluirCuentaCorriente, 
    montoCuentaCorriente, 
    cuentaCorrienteId 
  } = validatedFields.data;

  try {
    // Calcular monto total y preparar notas con detalle
    const montoTotal = monto + (incluirCuentaCorriente && montoCuentaCorriente ? montoCuentaCorriente : 0);
    let notasCompletas = notas || '';
    
    if (incluirCuentaCorriente && montoCuentaCorriente && montoCuentaCorriente > 0) {
      notasCompletas = `Cuota: $${monto.toFixed(2)} + Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)} = Total: $${montoTotal.toFixed(2)}${notas ? ' | ' + notas : ''}`;
    }

    // Crear transacción principal con monto total
    const transaccion = await prisma.transaccion.create({
      data: {
        suscripcionId,
        monto: montoTotal,
        metodoPago,
        notas: notasCompletas,
      },
    });

    // Si se incluye pago de cuenta corriente, registrar el movimiento
    if (incluirCuentaCorriente && cuentaCorrienteId && montoCuentaCorriente && montoCuentaCorriente > 0) {
      const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
        where: { id: cuentaCorrienteId },
      });

      if (cuentaCorriente && cuentaCorriente.estado === 'ACTIVO') {
        let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
        let nuevoSaldoCredito = cuentaCorriente.saldoCredito;
        let montoPendiente = new Decimal(montoCuentaCorriente);

        // Primero, aplicar al saldo de deuda
        if (nuevoSaldoDeuda.greaterThan(0)) {
          if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoDeuda)) {
            montoPendiente = montoPendiente.minus(nuevoSaldoDeuda);
            nuevoSaldoDeuda = new Decimal(0);
          } else {
            nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoPendiente);
            montoPendiente = new Decimal(0);
          }
        }

        // Si queda dinero, aplicar al crédito
        if (montoPendiente.greaterThan(0)) {
          if (nuevoSaldoCredito.greaterThan(0)) {
            if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoCredito)) {
              montoPendiente = montoPendiente.minus(nuevoSaldoCredito);
              nuevoSaldoCredito = new Decimal(0);
            } else {
              nuevoSaldoCredito = nuevoSaldoCredito.minus(montoPendiente);
              montoPendiente = new Decimal(0);
            }
          } else {
            nuevoSaldoCredito = montoPendiente;
          }
        }

        const nuevoEstado = nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
          ? 'SALDADO'
          : 'ACTIVO';

        await prisma.$transaction([
          prisma.movimientoCuentaCorriente.create({
            data: {
              cuentaCorrienteId,
              tipo: 'PAGO',
              monto: new Decimal(montoCuentaCorriente),
              descripcion: `Pago de cuota + cuenta corriente (Transacción #${transaccion.id})`,
              transaccionId: transaccion.id,
            },
          }),
          prisma.cuentaCorriente.update({
            where: { id: cuentaCorrienteId },
            data: {
              saldoDeuda: nuevoSaldoDeuda,
              saldoCredito: nuevoSaldoCredito,
              estado: nuevoEstado,
            },
          }),
        ]);
      }
    }
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo registrar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
  revalidatePath('/admin/cuenta-corriente');
  redirect('/admin/transacciones');
}
```

### 6.3 Actualizar Formulario de Transacciones

En `src/components/transacciones/create-form.tsx`, agregar:

```typescript
// Al inicio del componente, agregar estados
const [selectedSuscripcion, setSelectedSuscripcion] = useState<SuscripcionConRelaciones | null>(null);
const [incluirCuentaCorriente, setIncluirCuentaCorriente] = useState(false);
const [montoCuota, setMontoCuota] = useState<number>(0);
const [montoCuentaCorriente, setMontoCuentaCorriente] = useState<number>(0);

const cuentaCorriente = selectedSuscripcion?.socio?.cuentaCorriente;
const tieneCuentaCorriente = cuentaCorriente && cuentaCorriente.estado === 'ACTIVO';
const saldoDeuda = tieneCuentaCorriente ? cuentaCorriente.saldoDeuda : 0;
const saldoCredito = tieneCuentaCorriente ? cuentaCorriente.saldoCredito : 0;
const saldoNeto = saldoDeuda - saldoCredito;

// Agregar en el JSX, después de seleccionar suscripción:
{selectedSuscripcion && tieneCuentaCorriente && saldoNeto > 0 && (
  <div className="mb-4 rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
    {/* ... UI para mostrar deuda y checkbox para incluir pago */}
  </div>
)}
```

---

## 🎯 7. Navegación

### Agregar al menú en `src/components/admin/nav-links.tsx`

```typescript
const links = [
  // ... otros links
  { name: 'Transacciones', href: '/admin/transacciones', icon: CurrencyDollarIcon },
  { name: 'Cuenta Corriente', href: '/admin/cuenta-corriente', icon: DocumentTextIcon },
  // ... más links
];
```

---

## 📝 8. Tipos TypeScript

### Extender tipos existentes

```typescript
// En data-transacciones.ts o donde corresponda
type SuscripcionConRelaciones = Suscripcion & {
  socio: Socio & {
    cuentaCorriente?: {
      id: string;
      saldoDeuda: number;
      saldoCredito: number;
      estado: string;
    } | null;
  };
  plan: Omit<Plan, 'precio'> & { precio: number };
};
```

---

## ✅ 9. Checklist de Implementación

- [ ] 1. Actualizar `schema.prisma` con los modelos
- [ ] 2. Ejecutar migración de base de datos
- [ ] 3. Crear `actions-cuenta-corriente.ts`
- [ ] 4. Crear `data-cuenta-corriente.ts`
- [ ] 5. Crear componente `table.tsx`
- [ ] 6. Crear componente `manager.tsx`
- [ ] 7. Crear página principal `/cuenta-corriente`
- [ ] 8. Crear página individual `/cuenta-corriente/[id]`
- [ ] 9. Actualizar `actions-transacciones.ts`
- [ ] 10. Actualizar formulario de transacciones
- [ ] 11. Agregar link en navegación
- [ ] 12. Actualizar data de socios para incluir cuenta corriente
- [ ] 13. Actualizar tabla de transacciones para mostrar desglose
- [ ] 14. Actualizar ticket/comprobante

---

## 🎨 10. Componentes Adicionales Necesarios

Si no existen, crear estos componentes auxiliares:

### `src/components/ui/search.tsx`
Componente de búsqueda reutilizable con debounce.

### `src/components/ui/status-filter.tsx`
Filtro dropdown genérico para estados.

---

## 🧪 11. Testing

### Flujo a probar:

1. **Abrir cuenta corriente** a un socio
2. **Registrar deuda** manualmente
3. **Registrar pago** desde transacciones
4. Verificar que los **saldos se actualizan** correctamente
5. Verificar que el **estado cambia a SALDADO** cuando corresponde
6. Verificar que el **ticket muestra el desglose** correcto
7. Probar **filtros y búsquedas**

---

## 📊 12. Lógica de Negocio Clave

### Cálculo de Saldo Neto
```
Saldo Neto = Deuda - Crédito

Si Saldo Neto > 0 → El socio DEBE dinero
Si Saldo Neto < 0 → El socio tiene CRÉDITO a favor
Si Saldo Neto = 0 → Está SALDADO
```

### Aplicación de Pagos
1. Primero se paga la **DEUDA**
2. Si sobra dinero, se paga el **CRÉDITO**
3. Si aún sobra, se convierte en **CRÉDITO A FAVOR**

### Estados de Cuenta Corriente
- **ACTIVO**: Cuenta operativa (puede tener saldo o estar en 0)
- **SALDADO**: Ambos saldos en 0
- **CERRADO**: Cuenta cerrada permanentemente

---

## 🚀 13. Mejoras Futuras

- [ ] Exportar historial de movimientos a PDF/Excel
- [ ] Notificaciones automáticas cuando hay deuda
- [ ] Envío de estado de cuenta por WhatsApp
- [ ] Dashboard con estadísticas de cuentas corrientes
- [ ] Límite de crédito configurable por socio
- [ ] Intereses por mora (opcional)
- [ ] Planes de pago personalizados

---

## 📚 14. Recursos y Referencias

- [Prisma Docs - Decimal Type](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-decimal)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Validation](https://zod.dev/)

---

## 💡 15. Notas Importantes

1. **Siempre usar transacciones de Prisma** para operaciones que afectan múltiples tablas
2. **Convertir Decimal a number** antes de enviar al cliente
3. **Usar `new Decimal()`** para todas las operaciones matemáticas con montos
4. **Revalidar paths** después de cada operación que modifica datos
5. El campo `notas` en transacciones almacena el **desglose completo** del pago

---

## 🎉 Resultado Final

Un sistema completo de Cuenta Corriente que:
- ✅ Gestiona deudas y créditos de forma transparente
- ✅ Se integra automáticamente con pagos
- ✅ Proporciona historial detallado
- ✅ Interfaz intuitiva con búsqueda y filtros
- ✅ Tickets con desglose completo
- ✅ Estados automáticos (ACTIVO/SALDADO)
- ✅ Responsive y con soporte de tema oscuro

---

**Creado por:** Sistema de Gestión de Gimnasio  
**Fecha:** Enero 2026  
**Versión:** 1.0
