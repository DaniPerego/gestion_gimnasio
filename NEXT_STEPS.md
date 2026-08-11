# Próximos Pasos - Sesión del 04/12/2025

## Bugs Pendientes
- [ ] **Arreglar Toggle de Tema:** El botón de cambio de tema quedó "trabado" en modo oscuro. El icono del sol aparece, pero al hacer clic no cambia a modo claro. Revisar configuración de `next-themes` y `tailwind.config.ts` (posible conflicto con la clase `dark` o la estrategia de hidratación).

## Tareas Futuras
- [ ] Continuar puliendo la interfaz visual.
- [ ] Revisar feedback del despliegue en Vercel.

## Estado Actual
- Modo Kiosco: Implementado y funcionando (ruta `/kiosco`).
- Navegación Móvil: Implementada.
- Modo Oscuro: Implementado parcialmente (persistencia funciona, pero el toggle tiene un bug).
