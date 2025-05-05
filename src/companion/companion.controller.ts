import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanionService } from './companion.service';
import { CreateCompanionDto } from './dto/create-companion.dto';
import { UpdateCompanionDto } from './dto/update-companion.dto';

@Controller('companion')
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

  @Post()
  create(@Body() createCompanionDto: CreateCompanionDto) {
    return this.companionService.create(createCompanionDto);
  }

  @Get()
  findAll() {
    return this.companionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanionDto: UpdateCompanionDto,
  ) {
    return this.companionService.update(+id, updateCompanionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companionService.remove(+id);
  }
}
