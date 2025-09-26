import { normalizeSlug } from 'src/common/utils/util';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const fileExtension = file.mimetype.split('/')[1];
  const lastDotIndex = file.originalname.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return callback(new Error('Archivo vacío'), false);
  }

  const name = file.originalname.substring(0, lastDotIndex);
  const fileName = `${normalizeSlug(name)}.${fileExtension}`;

  callback(null, fileName);
};
