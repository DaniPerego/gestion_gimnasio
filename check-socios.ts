import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const socios = await prisma.socio.findMany();
  console.log('Total socios:', socios.length);
  socios.forEach(s => {
    console.log(`- ${s.nombre} ${s.apellido} (DNI: ${s.dni}) - Activo: ${s.activo}`);
  });
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
