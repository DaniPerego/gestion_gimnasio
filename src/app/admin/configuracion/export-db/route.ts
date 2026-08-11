import { NextResponse } from 'next/server';
import { SociosDB, SuscripcionesDB, TransaccionesDB, PlanesDB, UsuariosDB, AsistenciasDB, ConfiguracionDB } from '@/lib/db';

export async function GET() {
  // For demo mode, we return the localStorage keys that the client should export
  // The actual export happens client-side since we can't access localStorage from the server
  return NextResponse.json({ 
    message: 'Demo mode: use client-side export',
    keys: [
      'gym_socios',
      'gym_suscripciones', 
      'gym_transacciones',
      'gym_planes',
      'gym_usuarios',
      'gym_asistencias',
      'gym_configuracion',
      'gym_cuentas_corrientes',
      'gym_movimientos_cc',
    ]
  });
}
