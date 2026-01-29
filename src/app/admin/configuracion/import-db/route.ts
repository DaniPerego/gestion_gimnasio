import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Campos válidos por modelo
const VALID_FIELDS = {
  configuracion: ['nombreGimnasio', 'colorPrimario', 'colorSecundario', 'logoUrl', 'fondoUrl'],
  usuario: ['email', 'password', 'nombre', 'rol', 'permisoSocios', 'permisoPlanes', 'permisoSuscripciones', 'permisoAsistencias', 'permisoReportes', 'permisoConfiguracion', 'permisoUsuarios', 'permisoTransacciones', 'createdAt', 'updatedAt'],
  plan: ['nombre', 'precio', 'duracionMeses', 'descripcion', 'allowsMusculacion', 'allowsCrossfit', 'createdAt', 'updatedAt'],
  socio: ['nombre', 'apellido', 'dni', 'email', 'telefono', 'fechaNacimiento', 'genero', 'direccion', 'contactoEmergencia', 'telefonoEmergencia', 'condicionesMedicas', 'objetivo', 'esLibre', 'activo', 'createdAt', 'updatedAt'],
  suscripcion: ['socioId', 'planId', 'fechaInicio', 'fechaFin', 'estado', 'monto', 'createdAt', 'updatedAt'],
  transaccion: ['socioId', 'monto', 'tipo', 'metodo', 'descripcion', 'fecha', 'notas', 'createdAt', 'updatedAt'],
  asistencia: ['socioId', 'fecha', 'hora', 'disciplina', 'createdAt', 'updatedAt'],
};

// Función para sanitizar datos
function sanitizeData(data: any[], modelName: keyof typeof VALID_FIELDS): any[] {
  const validFields = VALID_FIELDS[modelName];
  return data.map((item) => {
    const sanitized: any = {};
    validFields.forEach((field) => {
      if (field in item) {
        sanitized[field] = item[field];
      }
    });
    return sanitized;
  });
}

// Función para procesar socios con campos requeridos faltantes
function processSocios(socios: any[]): any[] {
  const validFields = VALID_FIELDS.socio;
  let dniCounter = 10000000; // Contador para DNI automático
  
  return socios.map((socio) => {
    // Primero filtrar solo campos válidos
    const sanitized: any = {};
    validFields.forEach((field) => {
      if (field in socio) {
        sanitized[field] = socio[field];
      }
    });
    
    // Generar apellido si falta
    if (!sanitized.apellido || sanitized.apellido.trim() === '') {
      // Intentar extraer del nombre (si hay espacio)
      const nombreParts = (sanitized.nombre || '').trim().split(' ');
      if (nombreParts.length > 1) {
        sanitized.apellido = nombreParts[nombreParts.length - 1];
      } else {
        sanitized.apellido = 'S/A'; // Sin Apellido
      }
    }
    
    // Generar DNI único si falta
    if (!sanitized.dni || sanitized.dni.trim() === '') {
      sanitized.dni = `AUTO-${dniCounter++}`;
    }
    
    // Asegurar que activo exista
    if (!('activo' in sanitized)) {
      sanitized.activo = true;
    }
    
    return sanitized;
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se envió archivo.' },
        { status: 400 }
      );
    }

    // Validar que sea un archivo JSON
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'El archivo debe ser de tipo JSON.' },
        { status: 400 }
      );
    }

    const text = await file.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'El archivo JSON no es válido.' },
        { status: 400 }
      );
    }

    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'El archivo debe contener un objeto JSON válido.' },
        { status: 400 }
      );
    }

    let importedCount = {
      configuracion: 0,
      usuarios: 0,
      planes: 0,
      socios: 0,
      suscripciones: 0,
      transacciones: 0,
      asistencias: 0,
    };

    // Importar en orden respetando claves foráneas
    try {
      // 1. Configuración (sin dependencias)
      if (Array.isArray(data.configuracion) && data.configuracion.length > 0) {
        const cleanData = sanitizeData(data.configuracion, 'configuracion').map(({ id, ...rest }: any) => rest);
        const result = await prisma.configuracion.createMany({
          data: cleanData,
        });
        importedCount.configuracion = result.count;
      }

      // 2. Usuarios (sin dependencias)
      if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
        const cleanData = sanitizeData(data.usuarios, 'usuario').map(({ id, ...rest }: any) => rest);
        const result = await prisma.usuario.createMany({
          data: cleanData,
        });
        importedCount.usuarios = result.count;
      }

      // 3. Planes (sin dependencias)
      if (Array.isArray(data.planes) && data.planes.length > 0) {
        const cleanData = sanitizeData(data.planes, 'plan').map(({ id, ...rest }: any) => rest);
        const result = await prisma.plan.createMany({
          data: cleanData,
        });
        importedCount.planes = result.count;
      }

      // 4. Socios (procesar con campos requeridos)
      // Crear mapeo de DNI → ID para después usar en suscripciones
      const dniToSocioId: Record<string, string> = {};
      const oldIdToNewId: Record<string, string> = {};
      
      if (Array.isArray(data.socios) && data.socios.length > 0) {
        const processedSocios = processSocios(data.socios);
        
        // Guardar mapeos DNI antiguo → objeto original
        processedSocios.forEach((socio: any) => {
          dniToSocioId[socio.dni] = socio.dni; // Usar DNI como referencia temporal
        });
        
        // Crear mapeo de IDs antiguos para suscripciones
        data.socios.forEach((originalSocio: any, index: number) => {
          if (originalSocio.id) {
            oldIdToNewId[originalSocio.id] = processedSocios[index].dni;
          }
        });
        
        const cleanData = processedSocios.map(({ id, ...rest }: any) => rest);
        const result = await prisma.socio.createMany({
          data: cleanData,
        });
        importedCount.socios = result.count;
      }

      // 5. Suscripciones (depende de socios y planes)
      if (Array.isArray(data.suscripciones) && data.suscripciones.length > 0) {
        // Obtener todos los socios y planes actuales para validar referencias
        const socios = await prisma.socio.findMany({ select: { id: true, dni: true } });
        const planes = await prisma.plan.findMany({ select: { id: true, nombre: true } });
        
        // Crear mapeos para búsqueda rápida
        const dniMap = new Map(socios.map(s => [s.dni, s.id]));
        const planMap = new Map(planes.map(p => [p.nombre, p.id]));
        
        // Filtrar y reconstruir suscripciones
        const validSuscripciones = data.suscripciones.filter((sub: any) => {
          // Si el socioId tiene DNI mapeado, usar el nuevo ID
          let validSocioId = false;
          let validPlanId = false;
          
          // Intentar encontrar el socio por DNI si viene en los datos originales
          if (data.socios) {
            const originalSocio = data.socios.find((s: any) => s.id === sub.socioId);
            if (originalSocio && dniMap.has(originalSocio.dni)) {
              validSocioId = true;
            }
          }
          
          // Intentar encontrar el plan por nombre o ID
          if (data.planes) {
            const originalPlan = data.planes.find((p: any) => p.id === sub.planId);
            if (originalPlan && (planMap.has(originalPlan.nombre) || planMap.has(originalPlan.id))) {
              validPlanId = true;
            }
          }
          
          return validSocioId && validPlanId;
        }).map((sub: any) => {
          const originalSocio = data.socios.find((s: any) => s.id === sub.socioId);
          const originalPlan = data.planes.find((p: any) => p.id === sub.planId);
          
          return {
            ...sub,
            socioId: originalSocio ? (dniMap.get(originalSocio.dni) || sub.socioId) : sub.socioId,
            planId: originalPlan ? (planMap.get(originalPlan.nombre) || planMap.get(originalPlan.id) || sub.planId) : sub.planId,
          };
        });
        
        if (validSuscripciones.length > 0) {
          const cleanData = sanitizeData(validSuscripciones, 'suscripcion').map(({ id, ...rest }: any) => rest);
          const result = await prisma.suscripcion.createMany({
            data: cleanData,
          });
          importedCount.suscripciones = result.count;
        }
      }

      // 6. Transacciones (depende de suscripcionId que cambió)
      // Se omiten las transacciones ya que los IDs de suscripción son nuevos
      // Estas se pueden recrear cuando se crean nuevas suscripciones

      // 7. Asistencias (depende de socios)
      if (Array.isArray(data.asistencias) && data.asistencias.length > 0) {
        // Obtener todos los socios actuales para validar referencias
        const socios = await prisma.socio.findMany({ select: { id: true, dni: true } });
        const dniMap = new Map(socios.map(s => [s.dni, s.id]));
        
        // Filtrar y reconstruir asistencias
        const validAsistencias = data.asistencias.filter((asis: any) => {
          // Intentar encontrar el socio por DNI
          if (data.socios) {
            const originalSocio = data.socios.find((s: any) => s.id === asis.socioId);
            if (originalSocio && dniMap.has(originalSocio.dni)) {
              return true;
            }
          }
          return false;
        }).map((asis: any) => {
          const originalSocio = data.socios.find((s: any) => s.id === asis.socioId);
          
          return {
            ...asis,
            socioId: originalSocio ? (dniMap.get(originalSocio.dni) || asis.socioId) : asis.socioId,
          };
        });
        
        if (validAsistencias.length > 0) {
          const cleanData = sanitizeData(validAsistencias, 'asistencia').map(({ id, ...rest }: any) => rest);
          const result = await prisma.asistencia.createMany({
            data: cleanData,
          });
          importedCount.asistencias = result.count;
        }
      }
    } catch (importError: any) {
      return NextResponse.json(
        {
          error: 'Error al importar datos',
          details: importError.message,
          importedCount,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos importada correctamente',
      importedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error al procesar el archivo',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
