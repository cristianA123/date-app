import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import * as bcrypt from 'bcryptjs';
import { successResponse } from 'src/utils/response';
import { UserAlreadyExistsError } from 'src/common/errors';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private readonly SALT_ROUNDS = 10;

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.SALT_ROUNDS,
    );

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });
    if (userExists) {
      throw new UserAlreadyExistsError(createUserDto.email);
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return successResponse(user);
  }

  findAll() {
    return this.prisma.user.findMany({
      omit: {
        password: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
