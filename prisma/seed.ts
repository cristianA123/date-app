// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

// async function main() {
//   // 1. Crear usuario administrador
//   const adminUser = await prisma.user.upsert({
//     where: { email: 'admin@example.com' },
//     update: {},
//     create: {
//       name: 'Administrador',
//       email: 'admin@example.com',
//       password: '$2b$10$EjB4N4JZ8Z1Z1Z1Z1Z1Z1u', // Contraseña: Admin1234 (hasheada)
//       role: 'admin',
//       phoneNumber: '+51987654321',
//       nationalId: '12345678',
//       verified: true,
//       country: 'Perú',
//       city: 'Lima',
//     },
//   });

//   // 2. Crear usuarios normales con datos falsos
//   const fakeUsers = Array(5)
//     .fill(null)
//     .map(() => ({
//       name: faker.person.fullName(),
//       email: faker.internet.email(),
//       password: faker.internet.password(), // En producción usar bcrypt
//       role: 'client' as const,
//       phoneNumber: faker.phone.number(),
//       nationalId: faker.string.numeric(8),
//       country: faker.location.country(),
//       city: faker.location.city(),
//       verified: Math.random() < 0.5,
//     }));

//   await prisma.user.createMany({
//     data: fakeUsers,
//     skipDuplicates: true,
//   });

//   // 3. Crear perfiles de acompañantes
//   const users = await prisma.user.findMany();

//   for (const user of users) {
//     await prisma.companionProfile.upsert({
//       where: { userId: user.id },
//       update: {},
//       create: {
//         userId: user.id,
//         age: faker.number.int({ min: 18, max: 45 }),
//         photo: faker.image.avatar(),
//         hobbies: faker.lorem.words(3),
//         hourlyRate: faker.number.float({ min: 30, max: 100, precision: 0.5 }),
//         availability: JSON.stringify({
//           days: faker.helpers.arrayElements(
//             ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
//             3,
//           ),
//           hours: `${faker.number.int({ min: 10, max: 18 })}:00 - ${faker.number.int({ min: 19, max: 23 })}:00`,
//         }),
//       },
//     });
//   }

//   // 4. Crear ubicaciones
//   const locations = Array(5)
//     .fill(null)
//     .map(() => ({
//       name: faker.location.streetAddress(),
//       city: faker.location.city(),
//       country: faker.location.country(),
//       coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
//       isActive: true,
//       adminCreated: Math.random() < 0.5,
//     }));

//   await prisma.location.createMany({
//     data: locations,
//     skipDuplicates: true,
//   });

//   console.log('✅ Datos de prueba creados exitosamente!');
// }

// main()
//   .catch((e) => {
//     console.error('Error en el seeder:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
