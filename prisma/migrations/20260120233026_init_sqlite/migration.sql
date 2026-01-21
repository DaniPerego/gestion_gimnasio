-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'RECEPCIONISTA',
    "permisoSocios" BOOLEAN NOT NULL DEFAULT true,
    "permisoPlanes" BOOLEAN NOT NULL DEFAULT false,
    "permisoSuscripciones" BOOLEAN NOT NULL DEFAULT true,
    "permisoAsistencias" BOOLEAN NOT NULL DEFAULT true,
    "permisoReportes" BOOLEAN NOT NULL DEFAULT false,
    "permisoConfiguracion" BOOLEAN NOT NULL DEFAULT false,
    "permisoUsuarios" BOOLEAN NOT NULL DEFAULT false,
    "permisoTransacciones" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "esProfesorCrossfit" BOOLEAN NOT NULL DEFAULT false,
    "esProfesorMusculacion" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreGimnasio" TEXT NOT NULL DEFAULT 'Mi Gimnasio',
    "colorPrimario" TEXT NOT NULL DEFAULT '#000000',
    "colorSecundario" TEXT NOT NULL DEFAULT '#ffffff',
    "logoUrl" TEXT,
    "fondoUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Socio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fechaNacimiento" DATETIME,
    "genero" TEXT,
    "direccion" TEXT,
    "fotoUrl" TEXT,
    "contactoEmergencia" TEXT,
    "telefonoEmergencia" TEXT,
    "condicionesMedicas" TEXT,
    "objetivo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esLibre" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cuentaCorriente" TEXT
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL NOT NULL,
    "duracionMeses" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "allowsCrossfit" BOOLEAN NOT NULL DEFAULT false,
    "allowsMusculacion" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socioId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" DATETIME NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Suscripcion_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "suscripcionId" TEXT NOT NULL,
    "monto" DECIMAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" TEXT NOT NULL,
    "notas" TEXT,
    CONSTRAINT "Transaccion_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "Suscripcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socioId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asistencia_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Socio_dni_key" ON "Socio"("dni");
