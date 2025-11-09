import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Ruta completa de la carpeta. Ej: "Productos/Promociones/Vouchers"',
  })
  path: string;

  @ApiProperty({
    required: false,
    description: 'Carpeta raíz opcional (si no se usa, toma el default de .env)',
  })
  parentFolderId?: string;
}
