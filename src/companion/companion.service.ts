/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { CompanionFilterDto } from './dto/companion-filter.dto';
import { UserNotFoundByIdError } from 'src/common/errors';

@Injectable()
export class CompanionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanionDto: CreateCompanionDto) {

    // existe el usuario
    const userExists = await this.prisma.user.findUnique({
      where: {
        id: createCompanionDto.userId,
      },
    })

    if (!userExists) {
      throw new UserNotFoundByIdError(createCompanionDto.userId.toString());
    }

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
        ...createCompanionDto,
        // name: createCompanionDto.name,
        // age: createCompanionDto.age,
        // userId: createCompanionDto.userId,
        // department: createCompanionDto.department,
        // district: createCompanionDto.district,
        // description: createCompanionDto.description,
        // price: createCompanionDto.price,
        // sexualOrientation: createCompanionDto.sexualOrientation,
        // height: createCompanionDto.height,
        // gender: createCompanionDto.gender,
        // availableFrom: createCompanionDto.availableFrom,
        // availableUntil: createCompanionDto.availableUntil,
        // maxBookingHours: createCompanionDto.maxBookingHours,
      },
    });

    // CREAR PAYMENT
 
    // const payment = await this.prisma.payment.create({
    //   data: {
    //     amount: companionExists.data.price,
    //     status: 'PENDING',
    //     userId: createCompanionDto.userId,
    //   },
    // });

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

    const normalizedPath = file.path.replace(/\\/g, '/');

    const photo = await this.prisma.photo.create({
      data: {
        url: normalizedPath,
        cloudinaryId: `${Math.random()}-${new Date().toString()}`,
        companionProfile: {
          connect: {
            id: companion.id,
          },
        },
      },
    });

    return successResponse(photo);
  }

  async findAll(filters: CompanionFilterDto) {
    const filter = this.buildWhereConditions(filters);

    const companion = await this.prisma.companionProfile.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
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
    return successResponse(companion);
  }

  private buildWhereConditions(filters: any) {
    const where: any = {};

    if (filters.gender) where.gender = filters.gender;
    if (filters.age) where.age = filters.age;
    if (filters.department) where.department = filters.department;

    if (filters.minAge || filters.maxAge) {
      where.age = {};
      if (filters.minAge) where.age.gte = filters.minAge;
      if (filters.maxAge) where.age.lte = filters.maxAge;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.tagIds) {
      where.tags = {
        some: {
          name: {
            in: filters.tags,
          },
        },
      };
    }
    if (filters.dateTypeIds) {
      where.dateTypes = {
        some: {
          name: {
            in: filters.dateTypes,
          },
        },
      };
    }

    return where;
  }

  async findOne(id: number) {
    const companionExists = await this.prisma.companionProfile.findUnique({
      where: {
        id: id,
      },
    });
    if (!companionExists) {
      throw new CompanionNotExistsError(id);
    }

    const detailCompanion = await this.prisma.companionProfile.findUnique({
      where: {
        id: id,
      },
      include: {
        photos: true,
        tags: true,
        dateTypes: true,
      },
    });

    return successResponse(detailCompanion);
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
