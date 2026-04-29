import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContratoDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() productoId?: number;
  @ApiProperty() @Type(() => Number) @IsNumber() clienteId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() inmuebleId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() tipoProductoId: number;
  @ApiProperty() @IsString() @IsNotEmpty() expediente: string;
  @ApiProperty() @Type(() => Number) @IsNumber() periodoCuotaId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() tipoUsoId: number;
  @ApiProperty() @IsString() @IsNotEmpty() fechaPrimeraCuota: string; // DD/MM/YYYY
  @ApiProperty() @IsString() @IsNotEmpty() fechaFirma: string; // DD/MM/YYYY
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() interesPerial?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() tipoBaseCalculo?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() canonArriendo?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() interes?: number;
  @ApiProperty() @Type(() => Number) @IsNumber() region: number;
  @ApiProperty() @Type(() => Number) @IsNumber() montoTotal: number;
  @ApiProperty() @Type(() => Number) @IsNumber() numeroCuotas: number;
}

export class AddResolucionDto {
  @ApiProperty() @IsNumber() tipoResolucionId: number;
  @ApiProperty() @IsString() @IsNotEmpty() numeroResolucion: string;
  @ApiProperty() @IsNumber() anioResolucion: number;
  @ApiPropertyOptional() @IsOptional() @IsString() fechaResolucion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tipoAccion?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() causaTermino?: string;
}

export class AddAdjuntoDto {
  @ApiProperty() @IsNumber() tipoAdjuntoId: number;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() ruta: string;
}

export class AddFiscalizacionDto {
  @ApiProperty() @IsNumber() tipoFiscalizacionId: number;
  @ApiProperty() @IsString() @IsNotEmpty() fechaFiscalizacion: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombreFiscalizador: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apellidoPaterno?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacion?: string;
}

export class CambiarEstadoDto {
  @ApiProperty() @IsNumber() estadoProductoId: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() monto?: number;
}

export class PagoManualDto {
  @ApiProperty() @IsNumber() monto: number;
  @ApiProperty() @IsString() @IsNotEmpty() fechaPago: string; // DD/MM/YYYY
  @ApiPropertyOptional() @IsOptional() @IsString() glosa?: string;
  @ApiProperty() @IsNumber() tipoMovimientoId: number;
}
