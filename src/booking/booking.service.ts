import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { successResponse } from 'src/utils/response';
import { UserNotFoundByIdError } from 'src/common/errors';
import { CompanionNotExistsError } from 'src/common/errors/companion.errors';

@Injectable()
export class BookingService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    console.log(createBookingDto);

    const userExists = await this.prisma.user.findUnique({
      where: {
        id: createBookingDto.clientId,
      },
    })

    if (!userExists) {
      throw new UserNotFoundByIdError(createBookingDto.clientId.toString());
    }

    const companionExists = await this.prisma.companionProfile.findUnique({
      where: {
        userId: createBookingDto.clientId,
      },
    });

    if (!companionExists) {
      throw new CompanionNotExistsError(createBookingDto.clientId);
    }

    console.log('test');
    console.log(companionExists);
    console.log('test');

    // crear un nuevo booking
    const booking = await this.prisma.booking.create({
      data: {
        status: 'PENDING',
        ...createBookingDto,       
      },
    });

    // crear payment
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        totalAmount: booking.amountTotal,
        commission: booking.commission,
        companionAmount: booking.companionAmount,
        paymentMethod: 'PAYPAL',
        status: 'PENDING',
      },
    })

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
