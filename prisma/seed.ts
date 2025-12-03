import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gimnasio.com';
  const password = 'admin123'; // Contraseña temporal
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      nombre: 'Administrador Principal',
      password: hashedPassword,
      rol: 'ADMIN',
    },
  });

  console.log({ admin });
  
  // Crear configuración inicial por defecto si no existe
  const config = await prisma.configuracion.create({
      data: {
          nombreGimnasio: "Gimnasio Demo",
          colorPrimario: "#2563eb", // Azul estándar
          colorSecundario: "#1e40af"
      }
  }).catch(() => console.log("Configuración ya existente o error al crear"));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
