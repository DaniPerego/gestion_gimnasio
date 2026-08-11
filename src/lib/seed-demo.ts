import {
  UsuariosDB,
  ConfiguracionDB,
  SociosDB,
  PlanesDB,
  SuscripcionesDB,
  TransaccionesDB,
  AsistenciasDB,
} from './db';

export function seedDemoData() {
  // Check if already seeded
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem('gym_usuarios');
  if (existing) return;

  // ===== Admin User =====
  UsuariosDB.create({
    email: 'admin@gimnasio.com',
    password: 'admin123',
    nombre: 'Administrador Principal',
    rol: 'ADMIN',
    permisoSocios: true,
    permisoPlanes: true,
    permisoSuscripciones: true,
    permisoAsistencias: true,
    permisoReportes: true,
    permisoConfiguracion: true,
    permisoUsuarios: true,
    permisoTransacciones: true,
    esProfesorCrossfit: false,
    esProfesorMusculacion: false,
  });

  // ===== Configuracion =====
  ConfiguracionDB.create({
    nombreGimnasio: 'Gimnasio Demo',
    colorPrimario: '#2563eb',
    colorSecundario: '#1e40af',
    logoUrl: null,
    fondoUrl: null,
  });

  // ===== Planes =====
  const planBasico = PlanesDB.create({
    nombre: 'Básico',
    descripcion: 'Acceso a musculación',
    precio: 15000,
    duracionMeses: 1,
    activo: true,
    allowsCrossfit: false,
    allowsMusculacion: true,
  });

  const planPremium = PlanesDB.create({
    nombre: 'Premium',
    descripcion: 'Acceso a musculación y clases grupales',
    precio: 25000,
    duracionMeses: 1,
    activo: true,
    allowsCrossfit: false,
    allowsMusculacion: true,
  });

  const planCrossfit = PlanesDB.create({
    nombre: 'CrossFit',
    descripcion: 'Acceso exclusivo a CrossFit',
    precio: 30000,
    duracionMeses: 1,
    activo: true,
    allowsCrossfit: true,
    allowsMusculacion: false,
  });

  const planFull = PlanesDB.create({
    nombre: 'Full',
    descripcion: 'Acceso total: musculación, CrossFit y todas las clases',
    precio: 40000,
    duracionMeses: 1,
    activo: true,
    allowsCrossfit: true,
    allowsMusculacion: true,
  });

  // ===== Socios =====
  const socio1 = SociosDB.create({
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '30123456',
    email: 'juan.perez@email.com',
    telefono: '11-5555-1234',
    fechaNacimiento: new Date('1990-05-15'),
    genero: 'M',
    direccion: 'Av. Corrientes 1234',
    fotoUrl: null,
    contactoEmergencia: 'María Pérez',
    telefonoEmergencia: '11-5555-5678',
    condicionesMedicas: 'Ninguna',
    objetivo: 'Ganar masa muscular',
    activo: true,
    esLibre: false,
  });

  const socio2 = SociosDB.create({
    nombre: 'María',
    apellido: 'García',
    dni: '28654321',
    email: 'maria.garcia@email.com',
    telefono: '11-6666-1234',
    fechaNacimiento: new Date('1988-08-22'),
    genero: 'F',
    direccion: 'Calle Florida 567',
    fotoUrl: null,
    contactoEmergencia: 'Carlos García',
    telefonoEmergencia: '11-6666-5678',
    condicionesMedicas: 'Asma leve',
    objetivo: 'Perder peso y tonificar',
    activo: true,
    esLibre: false,
  });

  const socio3 = SociosDB.create({
    nombre: 'Carlos',
    apellido: 'López',
    dni: '32987654',
    email: 'carlos.lopez@email.com',
    telefono: '11-7777-1234',
    fechaNacimiento: new Date('1995-12-03'),
    genero: 'M',
    direccion: 'Av. San Martín 890',
    fotoUrl: null,
    contactoEmergencia: 'Ana López',
    telefonoEmergencia: '11-7777-5678',
    condicionesMedicas: 'Ninguna',
    objetivo: 'Mejorar resistencia',
    activo: true,
    esLibre: false,
  });

  const socio4 = SociosDB.create({
    nombre: 'Lucía',
    apellido: 'Martínez',
    dni: '27111222',
    email: 'lucia.martinez@email.com',
    telefono: '11-8888-1234',
    fechaNacimiento: new Date('1985-03-18'),
    genero: 'F',
    direccion: 'Calle Belgrano 456',
    fotoUrl: null,
    contactoEmergencia: 'Pedro Martínez',
    telefonoEmergencia: '11-8888-5678',
    condicionesMedicas: 'Lumbalgia',
    objetivo: 'Fortalecimiento general',
    activo: true,
    esLibre: false,
  });

  const socio5 = SociosDB.create({
    nombre: 'Roberto',
    apellido: 'Díaz',
    dni: '25333444',
    email: 'roberto.diaz@email.com',
    telefono: '11-9999-1234',
    fechaNacimiento: new Date('1982-11-25'),
    genero: 'M',
    direccion: 'Av. Rivadavia 789',
    fotoUrl: null,
    contactoEmergencia: 'Laura Díaz',
    telefonoEmergencia: '11-9999-5678',
    condicionesMedicas: 'Hipertensión controlada',
    objetivo: 'Mantener forma física',
    activo: true,
    esLibre: false,
  });

  const socio6 = SociosDB.create({
    nombre: 'Fernanda',
    apellido: 'Ruiz',
    dni: '33555666',
    email: 'fernanda.ruiz@email.com',
    telefono: '11-1010-1234',
    fechaNacimiento: new Date('1997-07-08'),
    genero: 'F',
    direccion: 'Calle Mendoza 321',
    fotoUrl: null,
    contactoEmergencia: 'Jorge Ruiz',
    telefonoEmergencia: '11-1010-5678',
    condicionesMedicas: 'Ninguna',
    objetivo: 'Competir en CrossFit',
    activo: true,
    esLibre: false,
  });

  // ===== Suscripciones =====
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const threeDaysBefore = new Date(now);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

  const tenDaysLater = new Date(now);
  tenDaysLater.setDate(tenDaysLater.getDate() + 10);

  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Socio1 - Premium activa (vence en 10 días)
  const sub1 = SuscripcionesDB.create({
    socioId: socio1.id,
    planId: planPremium.id,
    fechaInicio: threeDaysBefore,
    fechaFin: tenDaysLater,
    activa: true,
  });

  // Socio2 - Básico activa (vence en 2 días)
  const sub2 = SuscripcionesDB.create({
    socioId: socio2.id,
    planId: planBasico.id,
    fechaInicio: threeDaysBefore,
    fechaFin: twoDaysLater,
    activa: true,
  });

  // Socio3 - CrossFit activa (vence en 28 días)
  const sub3 = SuscripcionesDB.create({
    socioId: socio3.id,
    planId: planCrossfit.id,
    fechaInicio: now,
    fechaFin: oneMonthLater,
    activa: true,
  });

  // Socio4 - Full activa (vence en 15 días)
  const sub4 = SuscripcionesDB.create({
    socioId: socio4.id,
    planId: planFull.id,
    fechaInicio: now,
    fechaFin: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    activa: true,
  });

  // Socio5 - Premium vencida
  const sub5 = SuscripcionesDB.create({
    socioId: socio5.id,
    planId: planPremium.id,
    fechaInicio: thirtyDaysAgo,
    fechaFin: threeDaysBefore,
    activa: true,
  });

  // Socio6 - CrossFit activa
  const sub6 = SuscripcionesDB.create({
    socioId: socio6.id,
    planId: planCrossfit.id,
    fechaInicio: now,
    fechaFin: oneMonthLater,
    activa: true,
  });

  // ===== Transacciones =====
  TransaccionesDB.create({
    suscripcionId: sub1.id,
    tipoPago: 'CUOTA_SUSCRIPCION',
    monto: 25000,
    fecha: threeDaysBefore,
    metodoPago: 'EFECTIVO',
    notas: 'Cuota mensual Premium',
  });

  TransaccionesDB.create({
    suscripcionId: sub2.id,
    tipoPago: 'CUOTA_SUSCRIPCION',
    monto: 15000,
    fecha: threeDaysBefore,
    metodoPago: 'TRANSFERENCIA',
    notas: 'Cuota mensual Básico',
  });

  TransaccionesDB.create({
    suscripcionId: sub3.id,
    tipoPago: 'CUOTA_SUSCRIPCION',
    monto: 30000,
    fecha: now,
    metodoPago: 'TARJETA',
    notas: 'Cuota mensual CrossFit',
  });

  TransaccionesDB.create({
    suscripcionId: sub4.id,
    tipoPago: 'CUOTA_SUSCRIPCION',
    monto: 40000,
    fecha: now,
    metodoPago: 'EFECTIVO',
    notas: 'Cuota mensual Full',
  });

  TransaccionesDB.create({
    suscripcionId: sub6.id,
    tipoPago: 'CUOTA_SUSCRIPCION',
    monto: 30000,
    fecha: now,
    metodoPago: 'MERCADO_PAGO',
    notas: 'Cuota mensual CrossFit',
  });

  // ===== Asistencias (últimos 3 días) =====
  for (let i = 0; i < 3; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);

    if (i === 0) {
      // Hoy - varias asistencias
      AsistenciasDB.create({ socioId: socio1.id, fecha: new Date(date.getTime() - 2 * 60 * 60 * 1000) });
      AsistenciasDB.create({ socioId: socio3.id, fecha: new Date(date.getTime() - 1.5 * 60 * 60 * 1000) });
      AsistenciasDB.create({ socioId: socio4.id, fecha: new Date(date.getTime() - 1 * 60 * 60 * 1000) });
      AsistenciasDB.create({ socioId: socio6.id, fecha: new Date(date.getTime() - 0.5 * 60 * 60 * 1000) });
    } else if (i === 1) {
      AsistenciasDB.create({ socioId: socio1.id, fecha: date });
      AsistenciasDB.create({ socioId: socio2.id, fecha: new Date(date.getTime() + 60 * 60 * 1000) });
      AsistenciasDB.create({ socioId: socio5.id, fecha: new Date(date.getTime() + 2 * 60 * 60 * 1000) });
    } else {
      AsistenciasDB.create({ socioId: socio3.id, fecha: date });
      AsistenciasDB.create({ socioId: socio4.id, fecha: new Date(date.getTime() + 90 * 60 * 1000) });
    }
  }

  console.log('Demo data seeded successfully');
}
