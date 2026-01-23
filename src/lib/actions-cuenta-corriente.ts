'use server';

import { z } from 'zod';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';

// Schemas de validación
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

// Types
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

/**
 * Abrir una cuenta corriente para un socio
 */
export async function abrirCuentaCorriente(
  prevState: AbrirCuentaCorrienteState,
  formData: FormData
): Promise<AbrirCuentaCorrienteState> {
  // Validar datos
  const rawSocioId = formData.get('socioId');
  const rawDescripcion = formData.get('descripcion');
  
  console.log('abrirCuentaCorriente - datos recibidos:', { rawSocioId, rawDescripcion });
  
  const validatedFields = AbrirCuentaCorrienteSchema.safeParse({
    socioId: rawSocioId,
    descripcion: rawDescripcion,
  });

  if (!validatedFields.success) {
    console.error('Errores de validación:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación. Por favor revise los campos.',
      success: false,
    };
  }

  const { socioId, descripcion } = validatedFields.data;

  try {
    // Verificar si el socio existe
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
    });

    if (!socio) {
      return {
        message: 'El socio no existe.',
        success: false,
      };
    }

    // Verificar si ya tiene cuenta corriente
    const cuentaExistente = await prisma.cuentaCorriente.findUnique({
      where: { socioId },
    });

    if (cuentaExistente) {
      return {
        message: 'El socio ya tiene una cuenta corriente activa.',
        success: false,
      };
    }

    // Crear cuenta corriente
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

/**
 * Registrar un movimiento en la cuenta corriente
 */
export async function registrarMovimiento(
  prevState: RegistrarMovimientoState,
  formData: FormData
): Promise<RegistrarMovimientoState> {
  // Validar datos
  const validatedFields = RegistrarMovimientoSchema.safeParse({
    cuentaCorrienteId: formData.get('cuentaCorrienteId'),
    tipo: formData.get('tipo'),
    monto: formData.get('monto'),
    descripcion: formData.get('descripcion'),
    transaccionId: formData.get('transaccionId') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación. Por favor revise los campos.',
      success: false,
    };
  }

  const { cuentaCorrienteId, tipo, monto, descripcion, transaccionId } = validatedFields.data;

  try {
    // Obtener cuenta corriente actual
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    if (cuentaCorriente.estado !== 'ACTIVO') {
      return {
        message: 'La cuenta corriente no está activa.',
        success: false,
      };
    }

    // Calcular nuevos saldos
    let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
    let nuevoSaldoCredito = cuentaCorriente.saldoCredito;
    const montoDecimal = new Decimal(monto);

    switch (tipo) {
      case 'DEUDA':
        // Aumenta la deuda
        nuevoSaldoDeuda = nuevoSaldoDeuda.plus(montoDecimal);
        break;
      case 'CREDITO':
        // Aumenta el crédito a favor
        nuevoSaldoCredito = nuevoSaldoCredito.plus(montoDecimal);
        break;
      case 'PAGO':
        // Reduce deuda o crédito según corresponda
        if (nuevoSaldoDeuda.greaterThan(0)) {
          nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoDecimal).lessThan(0)
            ? new Decimal(0)
            : nuevoSaldoDeuda.minus(montoDecimal);
        } else if (nuevoSaldoCredito.greaterThan(0)) {
          nuevoSaldoCredito = nuevoSaldoCredito.minus(montoDecimal).lessThan(0)
            ? new Decimal(0)
            : nuevoSaldoCredito.minus(montoDecimal);
        }
        break;
      case 'AJUSTE':
        // Ajuste manual - puede ser positivo o negativo
        // Por simplicidad, ajustamos la deuda
        nuevoSaldoDeuda = nuevoSaldoDeuda.plus(montoDecimal);
        if (nuevoSaldoDeuda.lessThan(0)) {
          nuevoSaldoDeuda = new Decimal(0);
        }
        break;
    }

    // Crear movimiento y actualizar saldos en transacción
    await prisma.$transaction([
      prisma.movimientoCuentaCorriente.create({
        data: {
          cuentaCorrienteId,
          tipo,
          monto: montoDecimal,
          descripcion,
          transaccionId: transaccionId || null,
        },
      }),
      prisma.cuentaCorriente.update({
        where: { id: cuentaCorrienteId },
        data: {
          saldoDeuda: nuevoSaldoDeuda,
          saldoCredito: nuevoSaldoCredito,
          // Auto-cerrar si ambos saldos son 0
          estado:
            nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
              ? 'SALDADO'
              : 'ACTIVO',
        },
      }),
    ]);

    const socio = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
      select: { socioId: true },
    });

    if (socio) {
      revalidatePath(`/admin/socios/${socio.socioId}/edit`);
      revalidatePath('/admin/socios');
      revalidatePath('/admin/transacciones');
    }

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

/**
 * Cerrar una cuenta corriente (solo si saldo = 0)
 */
export async function cerrarCuentaCorriente(
  prevState: CerrarCuentaCorrienteState,
  formData: FormData
): Promise<CerrarCuentaCorrienteState> {
  // Validar datos
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
    // Obtener cuenta corriente
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    // Verificar que los saldos sean 0
    if (!cuentaCorriente.saldoDeuda.equals(0) || !cuentaCorriente.saldoCredito.equals(0)) {
      return {
        message: 'No se puede cerrar la cuenta con saldo pendiente.',
        success: false,
      };
    }

    // Cerrar cuenta
    await prisma.cuentaCorriente.update({
      where: { id: cuentaCorrienteId },
      data: { estado: 'CERRADO' },
    });

    revalidatePath(`/admin/socios/${cuentaCorriente.socioId}/edit`);
    revalidatePath('/admin/socios');

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

/**
 * Obtener saldo neto de una cuenta corriente
 */
export async function obtenerSaldoNeto(cuentaCorrienteId: string): Promise<number> {
  try {
    const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
      where: { id: cuentaCorrienteId },
    });

    if (!cuentaCorriente) return 0;

    // Saldo neto = deuda (positivo) - crédito (negativo)
    const saldoNeto = cuentaCorriente.saldoDeuda.minus(cuentaCorriente.saldoCredito);
    return saldoNeto.toNumber();
  } catch (error) {
    console.error('Error al obtener saldo neto:', error);
    return 0;
  }
}
