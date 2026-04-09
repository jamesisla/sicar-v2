import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuscarDeudaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() rut?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expediente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carpeta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() porcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() region?: number;
  @ApiProperty({ enum: [1, 2, 3], description: '1=arriendo, 2=venta, 3=concesion' })
  @IsNumber() @IsIn([1, 2, 3]) tipoProducto: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pageSize?: number;
}

export class RegistrarPagoCarteraDto {
  @ApiProperty() @IsString() @IsNotEmpty() fechaDocumento: string; // DD/MM/YYYY
  @ApiProperty() @IsNumber() monto: number;
  @ApiProperty() @IsNumber() numeroDocumento: number;
}

export class GenerarAvisoDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() cobranzaId?: number;
}
