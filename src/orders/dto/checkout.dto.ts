import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'uuid-direccion-envio' })
  @IsUUID()
  shippingAddressId: string;

  @ApiProperty({ example: 'uuid-datos-facturacion', required: false })
  @IsOptional()
  @IsUUID()
  billingProfileId?: string;

  @ApiProperty({
    example: 'Entregar a la tarde',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
