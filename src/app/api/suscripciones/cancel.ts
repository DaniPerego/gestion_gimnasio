import { NextResponse } from 'next/server';
import { SuscripcionesDB } from '@/lib/db';

export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }
  try {
    SuscripcionesDB.update({ id }, { activa: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo cancelar la suscripción' }, { status: 500 });
  }
}
