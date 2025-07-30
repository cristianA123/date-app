import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { CreditsService } from '../credits/credits.service';
import { successResponse } from 'src/utils/response';

@Injectable()
export class BookingService {

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => CreditsService))
    private creditsService: CreditsService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    console.log('Creating booking with DTO:', createBookingDto);
    
    try {
      // Calcular créditos necesarios basado en las horas
      const durationHours = createBookingDto.durationHours || 1;
      const requiredCredits = this.creditsService.calculateCreditsForHours(durationHours);

      // Verificar si el usuario tiene suficientes créditos
      const userCredits = await this.creditsService.getUserCredits(createBookingDto.clientId);
      
      if (userCredits.credits < requiredCredits) {
        throw new BadRequestException({
          message: `Créditos insuficientes. Necesitas ${requiredCredits} créditos, tienes ${userCredits.credits}`,
          error: 'INSUFFICIENT_CREDITS',
          requiredCredits,
          currentCredits: userCredits.credits,
          statusCode: 400
        });
      }

      // Convertir la fecha string a objeto Date
      const dateObject = typeof createBookingDto.date === 'string' 
        ? new Date(createBookingDto.date + 'T00:00:00.000Z') // Agregar tiempo para formato ISO completo
        : createBookingDto.date;

      // Convertir startTime y endTime a DateTime completos
      const dateString = typeof createBookingDto.date === 'string' 
        ? createBookingDto.date 
        : createBookingDto.date.toISOString().split('T')[0];

      const startDateTime = new Date(`${dateString}T${createBookingDto.startTime}:00.000Z`);
      const endDateTime = new Date(`${dateString}T${createBookingDto.endTime}:00.000Z`);

      // Preparar los datos para Prisma, excluyendo campos undefined
      const bookingData = {
        status: 'PENDING',
        clientId: createBookingDto.clientId,
        companionId: createBookingDto.companionId,
        date: dateObject,
        startTime: startDateTime,
        endTime: endDateTime,
        amount: createBookingDto.amount || requiredCredits, // Usar amount del DTO o créditos calculados
        paymentMethod: 'CREDITS',
        creditsUsed: requiredCredits, // Agregar créditos usados
        // Solo incluir campos opcionales si tienen valor
        ...(createBookingDto.locationId && { locationId: createBookingDto.locationId }),
        ...(createBookingDto.amountPerHour && { amountPerHour: createBookingDto.amountPerHour }),
        ...(createBookingDto.amountTax && { amountTax: createBookingDto.amountTax }),
        durationHours,
      };

      console.log('Prisma booking data:', bookingData);

      // Usar créditos
      await this.creditsService.useCredits(createBookingDto.clientId, {
        amount: requiredCredits,
      });

      const booking = await this.prisma.booking.create({
        data: bookingData,
      });

      console.log('Booking created successfully:', booking);
      return successResponse({
        ...booking,
        creditsUsed: requiredCredits,
        remainingCredits: userCredits.credits - requiredCredits,
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new BadRequestException(`Error al crear la reserva: ${error.message}`);
    }
  }

  async findAll() {
    const bookings = await this.prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(bookings);
  }

  async findByClient(clientId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { clientId },
      include: {
        companion: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(bookings);
  }

  async findByCompanion(companionId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { companionId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(bookings);
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return successResponse(booking);
  }

  async updateBookingStatus(bookingId: number, status: string, companionId?: number) {
    // Verificar que el booking existe
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Si se proporciona companionId, verificar que el companion es el dueño del booking
    if (companionId && booking.companionId !== companionId) {
      throw new ForbiddenException('No tienes permisos para modificar este booking');
    }

    // Actualizar el status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        companion: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    return successResponse(updatedBooking);
  }

  async findPendingByCompanion(companionId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { 
        companionId,
        status: 'PENDING'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(bookings);
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  async seedTestData() {
    try {
      // Datos de prueba para bookings
      const testBookings = [
        {
          status: 'PENDING',
          clientId: 1,
          companionId: 2,
          date: new Date('2024-12-20'),
          startTime: new Date('2024-12-20T14:00:00.000Z'),
          endTime: new Date('2024-12-20T16:00:00.000Z'),
          amount: 200,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 1,
          amountPerHour: 100,
        },
        {
          status: 'CONFIRMED',
          clientId: 1,
          companionId: 3,
          date: new Date('2024-12-22'),
          startTime: new Date('2024-12-22T18:00:00.000Z'),
          endTime: new Date('2024-12-22T20:00:00.000Z'),
          amount: 150,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 2,
          amountPerHour: 75,
        },
        {
          status: 'COMPLETED',
          clientId: 1,
          companionId: 2,
          date: new Date('2024-12-15'),
          startTime: new Date('2024-12-15T12:00:00.000Z'),
          endTime: new Date('2024-12-15T14:00:00.000Z'),
          amount: 180,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 3,
          amountPerHour: 90,
        },
        {
          status: 'CANCELLED',
          clientId: 1,
          companionId: 4,
          date: new Date('2024-12-18'),
          startTime: new Date('2024-12-18T16:00:00.000Z'),
          endTime: new Date('2024-12-18T18:00:00.000Z'),
          amount: 120,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 1,
          amountPerHour: 60,
        },
        // Bookings para companion (companionId: 2)
        {
          status: 'PENDING',
          clientId: 5,
          companionId: 2,
          date: new Date('2024-12-25'),
          startTime: new Date('2024-12-25T19:00:00.000Z'),
          endTime: new Date('2024-12-25T21:00:00.000Z'),
          amount: 220,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 2,
          amountPerHour: 110,
        },
        {
          status: 'CONFIRMED',
          clientId: 6,
          companionId: 2,
          date: new Date('2024-12-28'),
          startTime: new Date('2024-12-28T15:00:00.000Z'),
          endTime: new Date('2024-12-28T17:00:00.000Z'),
          amount: 160,
          paymentMethod: 'CREDITS',
          durationHours: 2,
          locationId: 1,
          amountPerHour: 80,
        },
      ];

      // Crear los bookings de prueba
      const createdBookings: any[] = [];
      for (const bookingData of testBookings) {
        const booking = await this.prisma.booking.create({
          data: bookingData,
        });
        createdBookings.push(booking);
      }

      return successResponse({
        message: 'Datos de prueba creados exitosamente',
        bookingsCreated: createdBookings.length,
        bookings: createdBookings,
      });
    } catch (error) {
      console.error('Error creating test data:', error);
      throw new BadRequestException(`Error al crear datos de prueba: ${error.message}`);
    }
  }
}
