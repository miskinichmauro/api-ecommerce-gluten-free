import { BadRequestException } from "@nestjs/common";
import { existsSync } from "fs";
import { join } from "path";
import { normalizeSlug } from "src/common/utils/util";

const validExtensions = ['png', 'jpeg', 'jpg', 'gif'];

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) {
        return callback(new BadRequestException('Archivo vacío'), false);
    }

    const fileExtension = file.mimetype.split('/')[1];
    const lastDotIndex = file.originalname.lastIndexOf('.');
    const name = file.originalname.substring(0, lastDotIndex);
    const fileName = `${normalizeSlug(name)}.${fileExtension}`;

    if (!validExtensions.includes(fileExtension) || lastDotIndex <= 0) {
        return callback(new BadRequestException('Extensión de archivo no válida'), false);
    }

    const uploadPath = join(process.cwd(), 'static/products', fileName);
    if (existsSync(uploadPath)) {
        return callback(new BadRequestException(`Ya existe un archivo con el mismo nombre: ${fileName}`), false);
    }

    callback(null, true);
}
