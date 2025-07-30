import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('/companion')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get('/client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.bookingService.findByClient(+clientId);
  }

  @Get('/companion/:companionId')
  findByCompanion(@Param('companionId') companionId: string) {
    return this.bookingService.findByCompanion(+companionId);
  }

  @Get('/companion/:companionId/pending')
  findPendingByCompanion(@Param('companionId') companionId: string) {
    return this.bookingService.findPendingByCompanion(+companionId);
  }

  @Patch('/:bookingId/status')
  updateBookingStatus(
    @Param('bookingId') bookingId: string, 
    @Body() statusData: { status: string; companionId?: number }
  ) {
    return this.bookingService.updateBookingStatus(+bookingId, statusData.status, statusData.companionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }

  @Post('/seed')
  seedTestData() {
    return this.bookingService.seedTestData();
  }
}
