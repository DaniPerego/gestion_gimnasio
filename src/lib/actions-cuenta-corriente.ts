'use server';

import { z } from 'zod';
import { SociosDB, CuentasCorrientesDB, MovimientosCCDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// === SCHEMAS ===

const AbrirCuentaCorrienteSchema = z.object({
  socioId: z.string().min(1, 'El socio es requerido'),
  descripcion: z.string().optional().nullable(),
});

const RegistrarMovimientoSchema = z.object({
  cuentaCorrienteId: z.string().min(1, 'La cuenta corriente es requerida'),
  tipo: z.enum(['DEUDA', 'CREDITO', 'PAGO', 'AJUSTE']),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  descripcion: z.string().min(1, 'La descripción es requerida').or(z.literal('')).transform(val => val || 'Sin descripción'),
  transaccionId: z.string().optional().nullable(),
});

const CerrarCuentaCorrienteSchema = z.object({
  cuentaCorrienteId: z.string().min(1, 'La cuenta corriente es requerida'),
});

const ReabrirCuentaCorrienteSchema = z.object({
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

type ReabrirCuentaCorrienteState = {
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
    const socio = SociosDB.findUnique({ id: socioId });

    if (!socio) {
      return {
        message: 'El socio no existe.',
        success: false,
      };
    }

    const cuentaExistente = CuentasCorrientesDB.findUnique({ socioId });

    if (cuentaExistente) {
      return {
        message: 'El socio ya tiene una cuenta corriente activa.',
        success: false,
      };
    }

    CuentasCorrientesDB.create({
      socioId,
      descripcion: descripcion || 'Cuenta corriente abierta',
      saldoDeuda: 0,
      saldoCredito: 0,
      estado: 'ACTIVO',
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
    const socio = SociosDB.findUnique({ id: socioId });

    if (!socio) {
      throw new Error('El socio no existe.');
    }

    const cuentaExistente = CuentasCorrientesDB.findUnique({ socioId });

    if (cuentaExistente) {
      throw new Error('El socio ya tiene una cuenta corriente activa.');
    }

    CuentasCorrientesDB.create({
      socioId,
      descripcion: descripcion || 'Cuenta corriente abierta',
      saldoDeuda: 0,
      saldoCredito: 0,
      estado: 'ACTIVO',
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
    console.error('Error de validación:', validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación. Verifica los campos.',
      success: false,
    };
  }

  const { cuentaCorrienteId, tipo, monto, descripcion, transaccionId } = validatedFields.data;

  try {
    const cuentaCorriente = CuentasCorrientesDB.findUnique({ id: cuentaCorrienteId });

    if (!cuentaCorriente) {
      console.error('Cuenta corriente no encontrada:', cuentaCorrienteId);
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    if (cuentaCorriente.estado === 'CERRADO') {
      return {
        message: 'No se pueden registrar movimientos en una cuenta cerrada. Debe reabrirla primero.',
        success: false,
      };
    }

    let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
    let nuevoSaldoCredito = cuentaCorriente.saldoCredito;

    switch (tipo) {
      case 'DEUDA':
        nuevoSaldoDeuda += monto;
        break;
      case 'CREDITO':
        nuevoSaldoCredito += monto;
        break;
      case 'PAGO':
        let montoPendiente = monto;
        
        if (nuevoSaldoDeuda > 0) {
          if (montoPendiente >= nuevoSaldoDeuda) {
            montoPendiente -= nuevoSaldoDeuda;
            nuevoSaldoDeuda = 0;
          } else {
            nuevoSaldoDeuda -= montoPendiente;
            montoPendiente = 0;
          }
        }
        
        if (montoPendiente > 0 && nuevoSaldoCredito > 0) {
          if (montoPendiente >= nuevoSaldoCredito) {
            montoPendiente -= nuevoSaldoCredito;
            nuevoSaldoCredito = 0;
          } else {
            nuevoSaldoCredito -= montoPendiente;
            montoPendiente = 0;
          }
        }
        break;
      case 'AJUSTE':
        break;
    }

    const nuevoEstado = cuentaCorriente.estado === 'CERRADO' ? 'CERRADO' : 'ACTIVO';

    MovimientosCCDB.create({
      cuentaCorrienteId,
      tipo,
      monto,
      descripcion,
      transaccionId: transaccionId || null,
    });

    CuentasCorrientesDB.update({ id: cuentaCorrienteId }, {
      saldoDeuda: nuevoSaldoDeuda,
      saldoCredito: nuevoSaldoCredito,
      estado: nuevoEstado,
    });

    revalidatePath(`/admin/cuenta-corriente/${cuentaCorriente.socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return {
      message: 'Movimiento registrado exitosamente.',
      success: true,
    };
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    return {
      message: `Error al registrar movimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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
    const cuentaCorriente = CuentasCorrientesDB.findUnique({ id: cuentaCorrienteId });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    const saldoNeto = cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito;

    if (saldoNeto !== 0) {
      return {
        message: 'No se puede cerrar una cuenta con saldo pendiente.',
        success: false,
      };
    }

    CuentasCorrientesDB.update({ id: cuentaCorrienteId }, { estado: 'CERRADO' });

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

// === REABRIR CUENTA CORRIENTE ===

export async function reabrirCuentaCorriente(
  prevState: ReabrirCuentaCorrienteState,
  formData: FormData
): Promise<ReabrirCuentaCorrienteState> {
  const validatedFields = ReabrirCuentaCorrienteSchema.safeParse({
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
    const cuentaCorriente = CuentasCorrientesDB.findUnique({ id: cuentaCorrienteId });

    if (!cuentaCorriente) {
      return {
        message: 'La cuenta corriente no existe.',
        success: false,
      };
    }

    if (cuentaCorriente.estado !== 'CERRADO') {
      return {
        message: 'Solo se pueden reabrir cuentas cerradas.',
        success: false,
      };
    }

    CuentasCorrientesDB.update({ id: cuentaCorrienteId }, { estado: 'ACTIVO' });

    revalidatePath(`/admin/cuenta-corriente/${cuentaCorriente.socioId}`);
    revalidatePath('/admin/cuenta-corriente');

    return {
      message: 'Cuenta corriente reabierta exitosamente.',
      success: true,
    };
  } catch (error) {
    console.error('Error al reabrir cuenta corriente:', error);
    return {
      message: 'Error al reabrir cuenta corriente.',
      success: false,
    };
  }
}

// === OBTENER SALDO NETO ===

export async function obtenerSaldoNeto(cuentaCorrienteId: string): Promise<number> {
  try {
    const cuentaCorriente = CuentasCorrientesDB.findUnique({ id: cuentaCorrienteId });

    if (!cuentaCorriente) return 0;

    const saldoNeto = cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito;
    return saldoNeto;
  } catch (error) {
    console.error('Error al obtener saldo neto:', error);
    return 0;
  }
}
