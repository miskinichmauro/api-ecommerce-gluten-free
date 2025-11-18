import { BadRequestException } from '@nestjs/common';
import type { Express } from 'express';

const validExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp'];

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) {
    return callback(new BadRequestException('Archivo vacío'), false);
  }

  const fileExtension = file.mimetype.split('/')[1]?.toLowerCase();
  const lastDotIndex = file.originalname.lastIndexOf('.');

  if (!fileExtension || lastDotIndex <= 0) {
    return callback(new BadRequestException('Archivo vacío'), false);
  }

  if (!validExtensions.includes(fileExtension)) {
    return callback(
      new BadRequestException('Extensión de archivo no válida'),
      false,
    );
  }

  callback(null, true);
};

