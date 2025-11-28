import { BadRequestException } from '@nestjs/common';
import type { Express } from 'express';

const validExtensions = ['png', 'jpeg', 'jpg', 'gif', 'webp'];

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) {
    return callback(
      new BadRequestException({
        message: 'Archivo vacío',
        code: 'FILE_EMPTY',
        expose: true,
      }),
      false,
    );
  }

  const fileExtension = file.mimetype.split('/')[1]?.toLowerCase();
  const lastDotIndex = file.originalname.lastIndexOf('.');

  if (!fileExtension || lastDotIndex <= 0) {
    return callback(
      new BadRequestException({
        message: 'Archivo vacío',
        code: 'FILE_EMPTY',
        expose: true,
      }),
      false,
    );
  }

  if (!validExtensions.includes(fileExtension)) {
    return callback(
      new BadRequestException({
        message: 'Extensión de archivo no válida',
        code: 'FILE_EXTENSION_INVALID',
        expose: true,
      }),
      false,
    );
  }

  callback(null, true);
};

