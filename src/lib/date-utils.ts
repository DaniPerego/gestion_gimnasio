// Utilidad para formatear fecha en formato occidental y horario Buenos Aires
// Este archivo NO debe tener 'use server'

export function formatFechaBuenosAires(date: Date | string): string {
  const fecha = typeof date === 'string' ? new Date(date) : date;
  // Ajustar a Buenos Aires (GMT-3)
  const fechaBA = new Date(fecha.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const dia = String(fechaBA.getDate()).padStart(2, '0');
  const mes = String(fechaBA.getMonth() + 1).padStart(2, '0');
  const anio = fechaBA.getFullYear();
  const horas = String(fechaBA.getHours()).padStart(2, '0');
  const minutos = String(fechaBA.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}
