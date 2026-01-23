# Análisis: Sistema de Cuenta Corriente para Socios

## 🎯 Propuesta Actual
Crear un JSON de cuenta corriente (crédito/deuda) por socio que:
- Sea opcional (abrir si el socio lo desea)
- Se muestre en transacciones
- Permita sumar al pago actual
- Se borre al pagar o se actualice

---

## 📊 Análisis de Arquitectura

### ❌ Problema con JSON Puro
Guardar cuenta corriente como JSON tiene limitaciones:
- **Sin búsqueda**: No puedes buscar socios con deuda
- **Sin validación**: Difícil mantener integridad de datos
- **Sin auditoría**: No hay historial de cambios
- **Sin relaciones**: Difícil hacer reportes

### ✅ Solución Recomendada: Modelo Prisma

**Crear tabla `CuentaCorriente`** en lugar de JSON:

```prisma
model CuentaCorriente {
  id            String      @id @default(cuid())
  socioId       String      @unique  // Relación 1-a-1
  saldoDeuda    Decimal     @default(0)  // Monto adeudado
  saldoCredito  Decimal     @default(0)  // Monto a favor
  
  descripcion   String?     // Ej: "Clases adelantadas", "Descuento pendiente"
  estado        String      @default("ACTIVO")  // ACTIVO, SALDADO, CERRADO
  
  socio         Socio       @relation(fields: [socioId], references: [id], onDelete: Cascade)
  movimientos   MovimientoCuentaCorriente[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([socioId])
}

model MovimientoCuentaCorriente {
  id                    String      @id @default(cuid())
  cuentaCorrienteId     String
  transaccionId         String?     // Link a transacción que pagó
  
  tipo                  String      // "DEUDA", "CREDITO", "PAGO", "AJUSTE"
  monto                 Decimal
  descripcion           String
  
  cuentaCorriente       CuentaCorriente @relation(fields: [cuentaCorrienteId], references: [id], onDelete: Cascade)
  
  createdAt             DateTime    @default(now())
  
  @@index([cuentaCorrienteId])
}
```

---

## 🔄 Flujo Operativo Propuesto

### 1️⃣ **Crear Cuenta Corriente**
   - En perfil de socio: botón "Abrir cuenta corriente"
   - Inicializa con saldo en 0
   - Opcional: agregar descripción inicial

### 2️⃣ **Registrar Deuda/Crédito**
   - Opción en transacciones: "Registrar en cuenta corriente"
   - Tipo: DEUDA (+monto adeudado) o CREDITO (-monto a favor)
   - Ejemplo: Socio quiere 2 clases gratis = CREDITO de $100

### 3️⃣ **En Formulario de Transacción**
   ```
   [Selector Socio] 
      ↓ (si tiene CuentaCorriente abierta)
   📊 Saldo: -$500 (deuda)
      ↓
   [Monto] (placeholder: "Incluir deuda: $500 + cuota: $800 = $1300")
   [✓] "Incluir saldo en pago" (checkbox)
      ↓ (si marca)
   Nuevo monto = cuota + deuda
   ```

### 4️⃣ **Al Procesar Pago**
   Si se marca "Incluir saldo":
   - Crea Transacción normal
   - Crea MovimientoCuentaCorriente de tipo "PAGO"
   - Reduce saldo en CuentaCorriente
   - Si saldo = 0, puede cerrarse automáticamente

---

## 🔧 Ventajas vs Desventajas

| Aspecto | JSON | Tabla Prisma |
|--------|------|-------------|
| **Búsqueda** | ❌ Difícil | ✅ Fácil con queries |
| **Auditoría** | ❌ Sin historial | ✅ MovimientoCuentaCorriente |
| **Integridad** | ❌ Manual | ✅ Constraints DB |
| **Reportes** | ❌ Complejo | ✅ Queries simples |
| **Transacciones** | ⚠️ Atómicas? | ✅ Garantizadas |
| **Performance** | ✅ Rápido (pequeño) | ✅ Indexado |

---

## 🛠️ Cambios Necesarios

### Base de Datos
- [x] Crear 2 nuevos modelos en schema.prisma
- [x] Ejecutar migración

### Backend
- [ ] `actions-socios.ts`: Crear/abrir cuenta corriente
- [ ] `actions-transacciones.ts`: Agregar flag `incluirCuentaCorriente`
- [ ] `data-socios-single.ts`: Obtener CuentaCorriente del socio

### Frontend
- [ ] `socios/edit-form.tsx`: Botón "Abrir/Cerrar cuenta corriente" con estado
- [ ] `transacciones/create-form.tsx`: 
  - Mostrar saldo si existe
  - Checkbox "Incluir saldo en pago"
  - Cálculo dinámico de monto

---

## 💡 Casos de Uso

### Caso 1: Deuda por Falta de Pago
- Socio no pagó cuota de enero
- Se registra en CuentaCorriente: deuda $800
- En febrero: paga $800 de enero + $800 de febrero = $1600

### Caso 2: Crédito Adelantado
- Socio paga 3 meses adelantados
- Se registra: credito $2400
- Al mes 3: auto-deduce el crédito

### Caso 3: Descuento Pendiente
- Socio solicitó 10% = -$80 de descuento
- Se registra: credito $80
- Se aplica en próximo pago

### Caso 4: Traspaso entre Planes
- Cambió de plan, quedó con saldo a favor
- CuentaCorriente guarda el saldo
- Se aplica al siguiente mes

---

## 📋 Plan de Implementación

### Fase 1: Base de Datos
1. Agregar modelos a schema.prisma
2. Ejecutar: `prisma migrate dev --name add_cuenta_corriente`

### Fase 2: Backend
1. Crear actions para operaciones de CuentaCorriente
2. Modificar createTransaccion para incluir lógica

### Fase 3: Frontend
1. UI en socios para abrir/cerrar cuenta corriente
2. UI en transacciones para usar saldo
3. Mostrar estado en dashboard

### Fase 4: Reportes
1. Reporte de "Deudores"
2. Reporte de "Créditos"

---

## 🎓 Recomendación Final

**Usar Tabla Prisma (NO JSON)** porque:
- ✅ Escalable a futuro (auditoría, historiales)
- ✅ Queries eficientes
- ✅ Integridad garantizada
- ✅ Reportes poderosos
- ✅ Mismo nivel de complejidad que JSON

**¿Quieres que comience la implementación?**
Puedo:
1. Actualizar schema.prisma
2. Crear las migrations
3. Implementar el backend
4. Actualizar los formularios
