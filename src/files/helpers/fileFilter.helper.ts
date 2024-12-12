import { BadRequestException } from '@nestjs/common';

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) return callback(new Error('No file provided'), false);

  const fileExtension = file.originalname.split('.').pop();
  const allowedExtensions = ['jpg', 'jpeg', 'png'];

  if (!allowedExtensions.includes(fileExtension)) {
    return callback(new BadRequestException('Invalid file type'), false);
  }

  callback(null, true);
};
