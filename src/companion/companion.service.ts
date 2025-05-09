import { Injectable, UploadedFile } from '@nestjs/common';
import { CreateCompanionDto } from './dto/create-companion.dto';
import { UpdateCompanionDto } from './dto/update-companion.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { successResponse } from 'src/utils/response';
import {
  CompanionAlreadyExistsError,
  CompanionNotExistsError,
} from 'src/common/errors/companion.errors';
import { SetTagToUserDto } from './dto/set-tag-to-companion.dto';
import { SetDateTypeToUserDto } from './dto/set-date-type-to-companion.dto copy';

@Injectable()
export class CompanionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanionDto: CreateCompanionDto) {
    const companionExists = await this.prisma.companionProfile.findUnique({
      where: {
        userId: createCompanionDto.userId,
      },
    });

    if (companionExists) {
      throw new CompanionAlreadyExistsError(createCompanionDto.userId);
    }

    const companion = await this.prisma.companionProfile.create({
      data: {
        name: createCompanionDto.name,
        age: createCompanionDto.age,
        userId: createCompanionDto.userId,
        department: createCompanionDto.department,
        district: createCompanionDto.district,
        description: createCompanionDto.description,
        price: createCompanionDto.price,
        sexualOrientation: createCompanionDto.sexualOrientation,
        height: createCompanionDto.height,
        gender: createCompanionDto.gender,
      },
    });

    return successResponse(companion);
  }

  async addPhoto(userId: number, @UploadedFile() file: Express.Multer.File) {
    const companion = await this.prisma.companionProfile.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!companion) {
      throw new CompanionNotExistsError(userId);
    }
    const photo = await this.prisma.photo.create({
      data: {
        url: file.path,
        companionProfile: {
          connect: {
            id: companion.id,
          },
        },
      },
    });

    return successResponse(photo);
  }

  findAll() {
    return this.prisma.companionProfile.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        department: true,
        price: true,
        photos: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.companionProfile.findUnique({
      where: {
        id: id,
      },
      include: {
        photos: true,
        tags: true,
        dateTypes: true,
      },
    });
  }

  async updateSetTagToUser(setTagToUserDto: SetTagToUserDto) {
    console.log(setTagToUserDto);
    const companion = await this.prisma.companionProfile.findUnique({
      where: {
        userId: setTagToUserDto.userId,
      },
    });
    if (!companion) {
      throw new CompanionNotExistsError(setTagToUserDto.userId);
    }
    const companionProfile = await this.prisma.companionProfile.update({
      where: {
        userId: setTagToUserDto.userId,
      },
      data: {
        tags: {
          connect: [...setTagToUserDto.tagIds], // IDs de los tags existentes
        },
      },
    });
    return successResponse(companionProfile);
  }

  async updateSetDateTypeToUser(setDateTypeToUserDto: SetDateTypeToUserDto) {
    console.log(setDateTypeToUserDto);
    const companion = await this.prisma.companionProfile.findUnique({
      where: {
        userId: setDateTypeToUserDto.userId,
      },
    });
    if (!companion) {
      throw new CompanionNotExistsError(setDateTypeToUserDto.userId);
    }
    const companionProfile = await this.prisma.companionProfile.update({
      where: {
        userId: setDateTypeToUserDto.userId,
      },
      data: {
        dateTypes: {
          connect: [...setDateTypeToUserDto.dateTypeIds], // IDs de los tags existentes
        },
      },
    });
    return successResponse(companionProfile);
  }

  update(id: number, updateCompanionDto: UpdateCompanionDto) {
    console.log(updateCompanionDto);
    return `This action updates a #${id} companion`;
  }

  remove(id: number) {
    return `This action removes a #${id} companion`;
  }
}
