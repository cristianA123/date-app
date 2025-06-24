// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
    console.log("Se ejecuto el Seed");
const clientPassword = await bcrypt.hash('clientpass', 10);
  // 1. Crear usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: clientPassword, // Contraseña: Admin1234 (hasheada)
      role: 'admin',
      phone: '+51987654321',
      verified: true,
    },
  });

  // 2. Crear usuarios normales con datos falsos
  const fakeUsers = Array(5)
    .fill(null)
    .map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: clientPassword, // En producción usar bcrypt
      role: 'client' as const,
      phone: faker.phone.number(),
    //   nationalId: faker.string.numeric(8),
    //   country: faker.location.country(),
    //   city: faker.location.city(),
      verified: Math.random() < 0.5,
    }));

  await prisma.user.createMany({
    data: fakeUsers,
    skipDuplicates: true,
  });

  // 3. Crear perfiles de acompañantes
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.companionProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 45 }),
        hourlyRate: faker.number.float({ min: 30, max: 100 }),
        department: faker.location.state(),
        district: faker.location.city(),
        description: faker.lorem.sentence(),
        gender: faker.helpers.arrayElement(['male', 'female']),
        price: faker.number.float({ min: 30, max: 100 }),
        availability: JSON.stringify({
          days: faker.helpers.arrayElements(
            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            3,
          ),
          hours: `${faker.number.int({ min: 10, max: 18 })}:00 - ${faker.number.int({ min: 19, max: 23 })}:00`,
        }),
        sexualOrientation: faker.person.fullName(),
        height: faker.number.float({ min: 30, max: 100})

      },
    });
  }

  // 4. Crear ubicaciones
  const locations = Array(5)
    .fill(null)
    .map(() => ({
      name: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
      isActive: true,
      adminCreated: Math.random() < 0.5,
    }));

  await prisma.location.createMany({
    data: locations,
    skipDuplicates: true,
  });

  console.log('✅ Datos de prueba creados exitosamente!');
}

// main()
//   .catch((e) => {
//     console.error('Error en el seeder:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
