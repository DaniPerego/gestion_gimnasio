import { NextRequest, NextResponse } from 'next/server';
import { fetchIngresosPorDia } from '@/lib/data-reportes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const año = parseInt(searchParams.get('año') || new Date().getFullYear().toString());
    const mes = parseInt(searchParams.get('mes') || (new Date().getMonth() + 1).toString());

    if (!año || !mes || mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    const ingresos = await fetchIngresosPorDia(año, mes);
    return NextResponse.json(ingresos);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingresos por día' },
      { status: 500 }
    );
  }
}
