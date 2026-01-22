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
  let dniCounter = 10000000; // Contador para DNI automático
  
  return socios.map((socio) => {
    const sanitized = { ...socio };
    
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
          skipDuplicates: true,
        });
        importedCount.configuracion = result.count;
      }

      // 2. Usuarios (sin dependencias)
      if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
        const cleanData = sanitizeData(data.usuarios, 'usuario').map(({ id, ...rest }: any) => rest);
        const result = await prisma.usuario.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.usuarios = result.count;
      }

      // 3. Planes (sin dependencias)
      if (Array.isArray(data.planes) && data.planes.length > 0) {
        const cleanData = sanitizeData(data.planes, 'plan').map(({ id, ...rest }: any) => rest);
        const result = await prisma.plan.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.planes = result.count;
      }

      // 4. Socios (procesar con campos requeridos)
      if (Array.isArray(data.socios) && data.socios.length > 0) {
        const cleanData = processSocios(data.socios).map(({ id, ...rest }: any) => rest);
        const result = await prisma.socio.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.socios = result.count;
      }

      // 5. Suscripciones (depende de socios y planes)
      if (Array.isArray(data.suscripciones) && data.suscripciones.length > 0) {
        const cleanData = sanitizeData(data.suscripciones, 'suscripcion').map(({ id, ...rest }: any) => rest);
        const result = await prisma.suscripcion.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.suscripciones = result.count;
      }

      // 6. Transacciones (depende de socios)
      if (Array.isArray(data.transacciones) && data.transacciones.length > 0) {
        const cleanData = sanitizeData(data.transacciones, 'transaccion').map(({ id, ...rest }: any) => rest);
        const result = await prisma.transaccion.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.transacciones = result.count;
      }

      // 7. Asistencias (depende de socios)
      if (Array.isArray(data.asistencias) && data.asistencias.length > 0) {
        const cleanData = sanitizeData(data.asistencias, 'asistencia').map(({ id, ...rest }: any) => rest);
        const result = await prisma.asistencia.createMany({
          data: cleanData,
          skipDuplicates: true,
        });
        importedCount.asistencias = result.count;
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
