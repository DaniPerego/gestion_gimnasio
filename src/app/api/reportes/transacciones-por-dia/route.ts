import { NextRequest, NextResponse } from 'next/server';
import { fetchTransaccionesPorDia } from '@/lib/data-reportes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const año = parseInt(searchParams.get('año') || new Date().getFullYear().toString());
    const mes = parseInt(searchParams.get('mes') || (new Date().getMonth() + 1).toString());
    const dia = parseInt(searchParams.get('dia') || new Date().getDate().toString());

    if (!año || !mes || !dia || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    const transacciones = await fetchTransaccionesPorDia(año, mes, dia);
    return NextResponse.json(transacciones);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener transacciones del día' },
      { status: 500 }
    );
  }
}
