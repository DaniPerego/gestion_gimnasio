import { SociosDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchSocioById(id: string) {
  noStore();
  try {
    const socio = SociosDB.findUnique({ id });
    return socio;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el socio.');
  }
}
