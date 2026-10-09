import { Module } from '@nestjs/common';
import { CloudinaryService } from './Cloudinary.services';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
