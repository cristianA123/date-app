import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import * as bcrypt from 'bcryptjs';
import { errorResponse, successResponse } from 'src/utils/response';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private readonly SALT_ROUNDS = 10;

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.SALT_ROUNDS,
      );

      // validar que el email no exista
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (userExists) {
        return errorResponse('El email ya existe');
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
    } catch (error) {
      console.error('[UsersService.create] Error:', error);
      return errorResponse('No se pudo crear el usuario');
    }
  }

  findAll() {
    return { a: 'aaa' };
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
