'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const ProductSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  codigo: z.string().optional(),
  activo: z.boolean().default(true),
});

export async function getProductos(query?: string) {
  const where = query
    ? {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' as const } },
          { codigo: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const productos = await prisma.producto.findMany({
    where,
    orderBy: { nombre: 'asc' },
  });
  return productos.map((p) => ({
    ...p,
    precio: p.precio.toNumber(),
  }));
}

export async function getProductoById(id: string) {
  const producto = await prisma.producto.findUnique({
    where: { id },
  });
  
  if (!producto) return null;

  return {
    ...producto,
    precio: producto.precio.toNumber(),
  };
}

export async function createProducto(prevState: any, formData: FormData) {
  const codigo = formData.get('codigo');
  const rawData = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    stock: formData.get('stock'),
    codigo: codigo === '' ? undefined : codigo, // Convertir string vacío a undefined para evitar error de unicidad
    activo: formData.get('activo') === 'on',
  };

  const validatedFields = ProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error en los campos. Por favor verifique.',
    };
  }

  try {
    await prisma.producto.create({
      data: validatedFields.data,
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    return {
      message: `Error de base de datos: ${(error as any).message}`,
    };
  }

  revalidatePath('/admin/productos');
  redirect('/admin/productos');
}

export async function updateProducto(id: string, formData: FormData) {
  const codigo = formData.get('codigo');
  const rawData = {
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    stock: formData.get('stock'),
    codigo: codigo === '' ? null : codigo, // Convertir string vacío a null
    activo: formData.get('activo') === 'on',
  };

  const validatedFields = ProductSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error en los campos. Por favor verifique.',
    };
  }

  try {
    await prisma.producto.update({
      where: { id },
      data: validatedFields.data,
    });
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo actualizar el producto.',
    };
  }

  revalidatePath('/admin/productos');
  redirect('/admin/productos');
}

export async function deleteProducto(id: string) {
  try {
    // Soft delete (desactivar) en lugar de borrar físicamente para mantener historial
    await prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
    revalidatePath('/admin/productos');
    return { message: 'Producto desactivado correctamente.' };
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo eliminar el producto.' };
  }
}
