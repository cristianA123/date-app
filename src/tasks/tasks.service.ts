import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'deletePendingBookings',
    timeZone: 'America/Lima', // Ajusta la zona horaria según sea necesario
  })
  async handlePendingBookingsCleanup() {
    this.logger.log('Iniciando tarea: Eliminar bookings pendientes antiguos...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const bookingsToDelete = await this.prisma.booking.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        select: {
          id: true, // Solo necesitamos el id para el log
        },
      });

      if (bookingsToDelete.length === 0) {
        this.logger.log('No hay bookings pendientes antiguos para eliminar.');
        return;
      }

      const idsToDelete = bookingsToDelete.map((booking) => booking.id);
      this.logger.log(
        `Bookings pendientes a eliminar (IDs): ${idsToDelete.join(', ')}`,
      );

      const deleteResult = await this.prisma.booking.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
          status: 'PENDING', // Doble check para seguridad
        },
      });

      this.logger.log(
        `Tarea completada: ${deleteResult.count} bookings pendientes antiguos eliminados.`,
      );
    } catch (error) {
      this.logger.error(
        'Error durante la eliminación de bookings pendientes antiguos:',
        error.stack,
      );
    }
  }

  // Método manual para ejecutar la limpieza (útil para testing o ejecución manual)
  async manualPendingBookingsCleanup(): Promise<{
    deletedCount: number;
    deletedIds: number[];
  }> {
    this.logger.log('Ejecutando limpieza manual de bookings pendientes...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const bookingsToDelete = await this.prisma.booking.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        select: {
          id: true,
        },
      });

      if (bookingsToDelete.length === 0) {
        this.logger.log('No hay bookings pendientes antiguos para eliminar.');
        return { deletedCount: 0, deletedIds: [] };
      }

      const idsToDelete = bookingsToDelete.map((booking) => booking.id);

      const deleteResult = await this.prisma.booking.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
          status: 'PENDING',
        },
      });

      this.logger.log(
        `Limpieza manual completada: ${deleteResult.count} bookings eliminados.`,
      );

      return { deletedCount: deleteResult.count, deletedIds: idsToDelete };
    } catch (error) {
      this.logger.error('Error durante la limpieza manual:', error.stack);
      throw error;
    }
  }

  // Método para obtener estadísticas de bookings pendientes antiguos
  async getPendingBookingsStats(): Promise<{
    totalPending: number;
    oldPending: number;
    oldestPendingDate: Date | null;
  }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalPending, oldPending, oldestBooking] = await Promise.all([
      this.prisma.booking.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.booking.count({
        where: {
          status: 'PENDING',
          createdAt: { lt: twentyFourHoursAgo },
        },
      }),
      this.prisma.booking.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalPending,
      oldPending,
      oldestPendingDate: oldestBooking?.createdAt || null,
    };
  }
}