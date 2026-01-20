import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Exportar todas las tablas principales
  const socios = await prisma.socio.findMany();
  const suscripciones = await prisma.suscripcion.findMany();
  const transacciones = await prisma.transaccion.findMany();
  const planes = await prisma.plan.findMany();
  const usuarios = await prisma.usuario.findMany();
  const asistencias = await prisma.asistencia.findMany();
  const configuracion = await prisma.configuracion.findMany();

  const data = {
    socios,
    suscripciones,
    transacciones,
    planes,
    usuarios,
    asistencias,
    configuracion,
  };

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="gimnasio-backup.json"',
    },
  });
}
