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
import { User as PrismaUser } from '@prisma/client';

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

  async findOneMe(id: number) {
    console.log({id});
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        companionProfile: {
          select: {
            id: true,
            availableMonday: true,
            availableTuesday: true,
            availableWednesday: true,
            availableThursday: true,
            availableFriday: true,
            availableSaturday: true,
            availableSunday: true,
            availableFrom: true,
            availableUntil: true,
            maxBookingHours: true,
          },
        },
      },
      omit: {
        password: true,
      },
    });

    if (!user) {
      throw new UserNotFoundByIdError(id.toString());
    }

    return successResponse(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    console.log('🔄 Updating user with data:', { id, updateUserDto });
    
    try {
      // Verificar si el usuario existe
      const userExists = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        console.error('❌ User not found:', id);
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
          console.error('❌ Email already exists:', updateUserDto.email);
          throw new UserAlreadyExistsError(updateUserDto.email);
        }
      }

      // Preparar datos para actualizar
      const dataToUpdate = { ...updateUserDto };
      
      // Si se actualiza la contraseña, hashearla
      if (updateUserDto.password) {
        const hashedPassword = await bcrypt.hash(
          updateUserDto.password,
          this.SALT_ROUNDS,
        );
        dataToUpdate.password = hashedPassword;
      }

      // Remover campos de disponibilidad del objeto principal (van al companion profile)
      const availabilityFields = [
        'availableMonday', 'availableTuesday', 'availableWednesday', 
        'availableThursday', 'availableFriday', 'availableSaturday', 'availableSunday'
      ];
      
      availabilityFields.forEach(field => {
        delete (dataToUpdate as any)[field];
      });

      console.log('📝 Data to update user:', dataToUpdate);

      // Actualizar el usuario
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
        omit: {
          password: true,
        },
      });

      console.log('✅ User updated successfully:', updatedUser.id);

      // Verificar si se está convirtiendo en acompañante o actualizando disponibilidad
      const isBecomingCompanion = updateUserDto.role === 'companion' || 
        availabilityFields.some(field => (updateUserDto as any)[field] !== undefined);

      // Si se está convirtiendo en acompañante, crear o actualizar el perfil de acompañante
      if (isBecomingCompanion) {
        console.log('🤝 Creating/updating companion profile...');
        await this.createOrUpdateCompanionProfile(id, updateUserDto);
      }

      return successResponse(updatedUser);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  private async createOrUpdateCompanionProfile(userId: number, updateUserDto: UpdateUserDto) {
    try {
      // Extraer campos de disponibilidad semanal del DTO
      const availabilityFields = {
        availableMonday: (updateUserDto as any).availableMonday ?? true,
        availableTuesday: (updateUserDto as any).availableTuesday ?? true,
        availableWednesday: (updateUserDto as any).availableWednesday ?? true,
        availableThursday: (updateUserDto as any).availableThursday ?? true,
        availableFriday: (updateUserDto as any).availableFriday ?? true,
        availableSaturday: (updateUserDto as any).availableSaturday ?? true,
        availableSunday: (updateUserDto as any).availableSunday ?? true,
      };

      // Verificar si ya existe un perfil de acompañante
      const existingProfile = await this.prisma.companionProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        // Actualizar perfil existente
        await this.prisma.companionProfile.update({
          where: { userId },
          data: {
            ...availabilityFields,
            // Actualizar otros campos si están presentes
            name: updateUserDto.name || existingProfile.name,
            country: updateUserDto.country || existingProfile.country,
            department: updateUserDto.department || existingProfile.department,
            district: updateUserDto.district || existingProfile.district,
            phone: updateUserDto.phone || existingProfile.phone,
          },
        });
        console.log('Companion profile updated for user:', userId);
      } else {
        // Crear nuevo perfil de acompañante
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        
        await this.prisma.companionProfile.create({
          data: {
            userId,
            name: updateUserDto.name || user?.name || 'Acompañante',
            age: 25, // Valor por defecto, se puede calcular desde birthday
            country: updateUserDto.country || 'Peru',
            department: updateUserDto.department || 'Lima',
            district: updateUserDto.district || 'Miraflores',
            description: 'Nuevo acompañante',
            sexualOrientation: updateUserDto.sexualOrientation || 'heterosexual',
            height: 170, // Valor por defecto
            gender: updateUserDto.gender || 'otro',
            price: 100, // Precio por defecto
            phone: updateUserDto.phone || '999999999',
            ...availabilityFields,
          },
        });
        console.log('New companion profile created for user:', userId);
      }
    } catch (error) {
      console.error('Error creating/updating companion profile:', error);
      // No lanzar error para no interrumpir la actualización del usuario
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
