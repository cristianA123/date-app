import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { successResponse } from 'src/utils/response';

@Injectable()
export class BookingService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    console.log(createBookingDto);
    // crear un nuevo booking
    const booking = await this.prisma.booking.create({
      data: {
        status: 'PENDING',
        ...createBookingDto,       
      },
    });

    return successResponse(booking);
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
