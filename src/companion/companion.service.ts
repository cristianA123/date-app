import { Injectable } from '@nestjs/common';
import { CreateCompanionDto } from './dto/create-companion.dto';
import { UpdateCompanionDto } from './dto/update-companion.dto';
import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { successResponse } from 'src/utils/response';
import { CompanionAlreadyExistsError } from 'src/common/errors/companion.errors';

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

  findAll() {
    return `This action returns all companion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} companion`;
  }

  update(id: number, updateCompanionDto: UpdateCompanionDto) {
    console.log(updateCompanionDto);
    return `This action updates a #${id} companion`;
  }

  remove(id: number) {
    return `This action removes a #${id} companion`;
  }
}
