import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrismaOrmService } from './prisma-orm.service';
import { CreatePrismaOrmDto } from './dto/create-prisma-orm.dto';
import { UpdatePrismaOrmDto } from './dto/update-prisma-orm.dto';

@Controller('prisma-orm')
export class PrismaOrmController {
  constructor(private readonly prismaOrmService: PrismaOrmService) {}

  @Post()
  create(@Body() createPrismaOrmDto: CreatePrismaOrmDto) {
    return this.prismaOrmService.create(createPrismaOrmDto);
  }

  @Get()
  findAll() {
    return this.prismaOrmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prismaOrmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrismaOrmDto: UpdatePrismaOrmDto) {
    return this.prismaOrmService.update(+id, updatePrismaOrmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prismaOrmService.remove(+id);
  }
}
