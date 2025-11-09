import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UploadToFolderDto {
  @ApiProperty({
    required: false,
    description: 'ID de la carpeta destino en Google Drive. Opcional.',
    example: '15tMSR51gHhVx8j_salg2....',
  })
  @IsOptional()
  folderId?: string;
}
