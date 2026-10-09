/* eslint-disable prettier/prettier */
import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

// Optional image upload: allows JPEG/PNG/WebP up to 5 MB, and lets the request omit the file.
export const optionalImagePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
  ],
});