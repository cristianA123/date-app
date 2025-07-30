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
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Req,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { CompanionService } from './companion.service';
import { CreateCompanionDto } from './dto/create-companion.dto';
import { UpdateCompanionDto } from './dto/update-companion.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/types/auth.types';
import { SetTagToUserDto } from './dto/set-tag-to-companion.dto';
import { SetDateTypeToUserDto } from './dto/set-date-type-to-companion.dto copy';
import { CompanionFilterDto } from './dto/companion-filter.dto';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { successResponse } from 'src/utils/response';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

const MAX_PROFILE_IMAGE_COUNT = 5;
const MAX_PROFILE_IMAGE_SIZE_MB = 5;
const MAX_PROFILE_IMAGE_SIZE_BYTES = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;

@Controller('companion')
export class CompanionController {
  constructor(
    private readonly companionService: CompanionService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Post()
  create(@Body() createCompanionDto: CreateCompanionDto) {
    return this.companionService.create(createCompanionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photos')
  @UseInterceptors(
    FilesInterceptor('photos', MAX_PROFILE_IMAGE_COUNT, { // 'photos' como el nombre del campo, y MAX_COUNT
      storage: memoryStorage(), // Usar memoryStorage para procesar en memoria
      limits: {
        fileSize: MAX_PROFILE_IMAGE_SIZE_BYTES,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Tipo de archivo no permitido: ${file.mimetype}. Permitidos: ${allowedTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadPhotos(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PROFILE_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|jpg)/ }),
        ],
        fileIsRequired: true,
      }),
    )
    files: Array<Express.Multer.File>,
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se subieron archivos.');
    }
    // Llamar al servicio para manejar la subida y asociación de las fotos
    return this.companionService.uploadAndAddPhotos(+req.user.userId, files);
  }

  @Post('/tag')
  updateSetTagToUser(@Body() setTagToUserDto: SetTagToUserDto) {
    return this.companionService.updateSetTagToUser(setTagToUserDto);
  }

  @Post('/date-type')
  updateSetDateTypeToUser(@Body() setDateTypeToUserDto: SetDateTypeToUserDto) {
    return this.companionService.updateSetDateTypeToUser(setDateTypeToUserDto);
  }

  @Get()
  findAll(@Query() filter: CompanionFilterDto) {
    return this.companionService.findAll(filter);
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

  @UseGuards(JwtAuthGuard)
  @Post('upload-cloudinary')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // máximo 10 MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten imágenes (JPEG, PNG, JPG, WebP)'), false);
        }
      },
    }),
  )
  async uploadImageToCloudinary(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No se subió ningún archivo');
    }

    try {
      const result = await this.imageUploadService.uploadImage(
        file.buffer,
        `companion-${req.user.userId}-${Date.now()}-${file.originalname}`,
      );

      return successResponse(
        {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          size: file.size,
          msg: 'Imagen subida exitosamente a Cloudinary',
        },
      );
    } catch (error) {
      throw new BadRequestException(`Error al subir imagen: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-multiple-cloudinary')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      limits: {
        fileSize: 10 * 1024 * 1024, // máximo 10 MB por archivo
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten imágenes (JPEG, PNG, JPG, WebP)'), false);
        }
      },
    }),
  )
  async uploadMultipleImagesToCloudinary(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se subieron archivos');
    }

    try {
      const uploadPromises = files.map((file, index) =>
        this.imageUploadService.uploadImage(
          file.buffer,
          `companion-${req.user.userId}-${Date.now()}-${index}-${file.originalname}`,
        ),
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result, index) => ({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        originalName: files[index].originalname,
        size: files[index].size,
      }));

      return successResponse(
        {
          images: uploadedImages,
          totalUploaded: uploadedImages.length,
          msg: `${uploadedImages.length} imágenes subidas exitosamente a Cloudinary`,
        },
      );
    } catch (error) {
      throw new BadRequestException(`Error al subir imágenes: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-cloudinary-image/:publicId')
  async deleteCloudinaryImage(@Param('publicId') publicId: string) {
    try {
      const result = await this.imageUploadService.deleteImage(publicId);
      return successResponse({
        ...result,
        msg:  'Imagen eliminada exitosamente de Cloudinary'
      });
    } catch (error) {
      throw new BadRequestException(`Error al eliminar imagen: ${error.message}`);
    }
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/pending')
  findAllPending() {
    return this.companionService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/approve')
  approveCompanion(@Param('id') id: string) {
    return this.companionService.approveCompanion(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/reject')
  rejectCompanion(@Param('id') id: string) {
    return this.companionService.rejectCompanion(+id);
  }
}
