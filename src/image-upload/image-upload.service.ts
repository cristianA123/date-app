import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class ImageUploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ secure_url: string; public_id: string }> {
    // Optimizar y convertir a WebP usando sharp
    const optimizedBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: fileName.substring(0, fileName.lastIndexOf('.')), // Usar nombre de archivo sin extensión como public_id
          format: 'webp',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary upload result is undefined.'));
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );

      const readableStream = new Readable();
      readableStream.push(optimizedBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  async uploadMultipleImages(
    files: { buffer: Buffer; originalname: string }[],
  ): Promise<{ secure_url: string; public_id: string }[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, file.originalname),
    );
    return Promise.all(uploadPromises);
  }

  async deleteMultipleImages(publicIds: string[]): Promise<any[]> {
    const deletePromises = publicIds.map((publicId) =>
      this.deleteImage(publicId),
    );
    return Promise.all(deletePromises);
  }
}