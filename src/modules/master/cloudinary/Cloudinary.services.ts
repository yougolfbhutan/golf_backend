/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadedImage {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }
   
  /**
   * Uploads an in-memory multer file (FileInterceptor without a custom
   * storage engine gives you file.buffer) to Cloudinary.
   */
  uploadImage(file: Express.Multer.File, folder = 'upload'): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      if (!file?.buffer) {
        reject(new Error('No file buffer to upload'));
        return;
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            const message = error?.message ?? 'Empty response from Cloudinary';
            this.logger.error(
              `Cloudinary upload failed${error?.http_code ? ` (${error.http_code})` : ''}: ${message}`,
            );
            reject(new Error(message));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }

  /**
   * Deletes an image when you only stored its URL.
   * Never throws: a failed cleanup should not fail the request.
   */
  async deleteByUrl(url: string): Promise<void> {
    const publicId = this.extractPublicId(url);
    if (!publicId) return;
    try {
      await this.deleteImage(publicId);
    } catch (error) {
      this.logger.warn(
        `Could not delete Cloudinary image ${publicId}: ${error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** https://res.cloudinary.com/<cloud>/image/upload/v123/balls/abc.jpg -> balls/abc */
  private extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    return match ? match[1] : null;
  }
}
