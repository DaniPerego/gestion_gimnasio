import { NextResponse } from 'next/server';
import { SuscripcionesDB } from '@/lib/db';

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }
  try {
    SuscripcionesDB.update({ id }, { activa: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo activar la suscripción' }, { status: 500 });
  }
}
