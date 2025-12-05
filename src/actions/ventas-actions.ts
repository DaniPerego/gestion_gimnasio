'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const VentaSchema = z.object({
  socioId: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productoId: z.string(),
      cantidad: z.number().int().min(1),
      precioUnitario: z.number().min(0),
    })
  ),
  metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
});

export async function createVenta(data: {
  socioId?: string | null;
  items: { productoId: string; cantidad: number; precioUnitario: number }[];
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
}) {
  const validatedFields = VentaSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Datos inválidos',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { socioId, items, metodoPago } = validatedFields.data;

  // Calcular total
  const total = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);

  try {
    // Iniciar transacción de base de datos
    await prisma.$transaction(async (tx) => {
      // 1. Crear la transacción (Venta)
      const transaccion = await tx.transaccion.create({
        data: {
          tipo: 'VENTA',
          monto: total,
          fecha: new Date(),
          metodoPago: metodoPago,
          socioId: socioId || null,
          notas: 'Venta de productos',
        },
      });

      // 2. Crear los items de la transacción y actualizar stock
      for (const item of items) {
        // Crear ItemTransaccion
        await tx.itemTransaccion.create({
          data: {
            transaccionId: transaccion.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.cantidad * item.precioUnitario,
          },
        });

        // Actualizar Stock del Producto
        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            stock: {
              decrement: item.cantidad,
            },
          },
        });
      }
    });

    revalidatePath('/admin/productos'); // Actualizar stock en la lista de productos
    revalidatePath('/admin/ventas');
    return { success: true, message: 'Venta realizada con éxito' };
  } catch (error) {
    console.error('Error al crear venta:', error);
    return { success: false, message: `Error al procesar la venta: ${(error as any).message}` };
  }
}

export async function getResumenCaja(fecha?: Date) {
  const date = fecha || new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const transacciones = await prisma.transaccion.findMany({
    where: {
      fecha: {
        gte: start,
        lte: end,
      },
      // We might want to include 'CUOTA' as well if "Cierre de Caja" includes subscriptions.
      // Usually it does. The user said "Cierre de Caja" in the context of the store, but usually it's all cash flow.
      // I'll include all transactions for now.
    },
    include: {
      socio: {
        select: { nombre: true, apellido: true },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  const resumen = {
    total: 0,
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    cantidadVentas: 0,
    cantidadCuotas: 0,
  };

  transacciones.forEach((t) => {
    const monto = Number(t.monto);
    resumen.total += monto;
    if (t.metodoPago === 'EFECTIVO') resumen.efectivo += monto;
    if (t.metodoPago === 'TARJETA') resumen.tarjeta += monto;
    if (t.metodoPago === 'TRANSFERENCIA') resumen.transferencia += monto;
    
    if (t.tipo === 'VENTA') resumen.cantidadVentas++;
    if (t.tipo === 'CUOTA') resumen.cantidadCuotas++;
  });

  return { transacciones, resumen };
}
