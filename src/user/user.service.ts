import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import * as bcrypt from 'bcryptjs';
import { successResponse } from 'src/utils/response';
import {
  UserAlreadyExistsError,
  UserNotFoundByIdError,
} from 'src/common/errors';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  private readonly SALT_ROUNDS = 10;

  async createUser(createUserDto: CreateUserDto) {
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
      omit: {
        password: true,
      },
    });

    const tokens = this.authService.generateTokens(user);

    return successResponse({ user, ...tokens });
  }

  findAll() {
    return this.prisma.user.findMany({
      omit: {
        password: true,
      },
    });
  }

  findOne(id: number) {
    const user = this.prisma.user.findFirst({
      where:{id}
    })

    if(!user){
     throw new UserNotFoundByIdError(id.toString());
    }

    return user;
  }

  findOneMe(id: number) {
    const user = this.prisma.user.findFirst({
      where:{id}
    })

    if(!user){
     throw new UserNotFoundByIdError(id.toString());
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    // Verificar si el usuario existe
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new UserNotFoundByIdError(id.toString());
    }

    // Si se actualiza el email, verificar que no exista otro usuario con ese email
    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new UserAlreadyExistsError(updateUserDto.email);
      }
    }

    // Si se actualiza la contraseña, hashearla
    const dataToUpdate = { ...updateUserDto };
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(
        updateUserDto.password,
        this.SALT_ROUNDS,
      );
      dataToUpdate.password = hashedPassword;
    }

    // Actualizar el usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      omit: {
        password: true,
      },
    });

    return successResponse(updatedUser);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
