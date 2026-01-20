import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No se envió archivo.' }, { status: 400 });
    }
    const text = await file.text();
    const data = JSON.parse(text);

    // Importar datos (ejemplo simple, deberías agregar validaciones y manejo de claves foráneas)
    if (data.configuracion) await prisma.configuracion.createMany({ data: data.configuracion });
    if (data.usuarios) await prisma.usuario.createMany({ data: data.usuarios });
    if (data.planes) await prisma.plan.createMany({ data: data.planes });
    if (data.socios) await prisma.socio.createMany({ data: data.socios });
    if (data.suscripciones) await prisma.suscripcion.createMany({ data: data.suscripciones });
    if (data.transacciones) await prisma.transaccion.createMany({ data: data.transacciones });
    if (data.asistencias) await prisma.asistencia.createMany({ data: data.asistencias });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al importar backup', details: error }, { status: 500 });
  }
}
