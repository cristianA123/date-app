import { PrismaService } from 'src/prisma-orm/prisma-orm.service';
import { CreateTagDto } from './dto/tag/create-tag.dto';
import { Injectable } from '@nestjs/common';
import { successResponse } from 'src/utils/response';
import { CreateDateTypeDto } from './dto/date-type/create-date-type.dto';

@Injectable()
export class CompanionAttributesService {
  constructor(private prisma: PrismaService) {}

  async creatTage(createTagDto: CreateTagDto) {
    const tagExists = await this.prisma.tag.findFirst({
      where: {
        name: createTagDto.name,
      },
    });
    if (tagExists) {
      throw new Error('DateType already exists');
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: createTagDto.name,
      },
    });

    return successResponse(tag);
  }

  async findAllTags() {
    const tags = await this.prisma.tag.findMany();
    return successResponse(tags);
  }

  async creatDateType(createDateTypeDto: CreateDateTypeDto) {
    // validar que no exita un dateType con el mismo nombre
    const dateTypeExists = await this.prisma.dateType.findFirst({
      where: {
        name: createDateTypeDto.name,
      },
    });
    if (dateTypeExists) {
      throw new Error('DateType already exists');
    }
    const tag = await this.prisma.dateType.create({
      data: {
        name: createDateTypeDto.name,
      },
    });
    return successResponse(tag);
  }

  async findAllDateType() {
    const tags = await this.prisma.dateType.findMany();
    return successResponse(tags);
  }

  findOne(id: number) {
    return `This action returns a #${id} companionAttribute`;
  }

  // update(id: number, updateCompanionAttributeDto: UpdateCompanionAttributeDto) {
  //   return `This action updates a #${id} companionAttribute`;
  // }
}
