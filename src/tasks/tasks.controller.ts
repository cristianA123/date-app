import { JwtAuthGuard } from './../auth/guard/jwt-auth.guard';
import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { successResponse } from 'src/utils/response';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('cleanup-pending-bookings')
  async manualCleanupPendingBookings() {
    const result = await this.tasksService.manualPendingBookingsCleanup();
    return successResponse({
      ...result,
      msg: 'Limpieza de bookings pendientes ejecutada'
    });
  }

  @Get('pending-bookings-stats')
  async getPendingBookingsStats() {
    const stats = await this.tasksService.getPendingBookingsStats();
    return successResponse({
      ...stats,
      msg: 'Estadísticas de bookings pendientes'
    });
  }
}