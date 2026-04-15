import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuscarDeudaQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() rut?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() expediente?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carpeta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() porcion?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() region?: number;
  @ApiProperty({ enum: [1, 2, 3], description: '1=arriendo, 2=venta, 3=concesion' })
  @Type(() => Number) @IsNumber() @IsIn([1, 2, 3]) tipoProducto: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
}

export class RegistrarPagoCarteraDto {
  @ApiProperty() @IsString() @IsNotEmpty() fechaDocumento: string; // DD/MM/YYYY
  @ApiProperty() @IsNumber() monto: number;
  @ApiProperty() @IsNumber() numeroDocumento: number;
}

export class GenerarAvisoDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() cobranzaId?: number;
}
