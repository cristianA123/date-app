import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompanionService } from './companion.service';
import { CreateCompanionDto } from './dto/create-companion.dto';
import { UpdateCompanionDto } from './dto/update-companion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/types/auth.types';

@Controller('companion')
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

  @Post()
  create(@Body() createCompanionDto: CreateCompanionDto) {
    return this.companionService.create(createCompanionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const randomName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${randomName}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // máximo 5 MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de archivo no permitido'), false);
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      return { success: false, message: 'No se subió ningún archivo' };
    }

    // agregar la foto al user en mi bd
    return this.companionService.addPhoto(+req.user.userId, file);

    // return {
    //   success: true,
    //   filename: file.filename,
    //   originalName: file.originalname,
    //   size: file.size,
    //   url: `/uploads/${file.filename}`, // este es el path accesible vía navegador
    // };
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
