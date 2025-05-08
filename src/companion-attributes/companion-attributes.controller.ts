import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CompanionAttributesService } from './companion-attributes.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { CreateDateTypeDto } from './dto/create-date-type.dto';

@Controller('companion-attributes')
export class CompanionAttributesController {
  constructor(
    private readonly companionAttributesService: CompanionAttributesService,
  ) {}

  @Post('/tag')
  creatTage(@Body() createTagDto: CreateTagDto) {
    return this.companionAttributesService.creatTage(createTagDto);
  }

  @Get('/tags')
  findAllTags() {
    return this.companionAttributesService.findAllTags();
  }

  @Post('/date-type')
  creatDateType(@Body() createDateTypeDto: CreateDateTypeDto) {
    return this.companionAttributesService.creatDateType(createDateTypeDto);
  }

  @Get('/date-types')
  findAllDateType() {
    return this.companionAttributesService.findAllDateType();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companionAttributesService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCompanionAttributeDto: UpdateCompanionAttributeDto,
  // ) {
  //   return this.companionAttributesService.update(
  //     +id,
  //     updateCompanionAttributeDto,
  //   );
  // }
}
