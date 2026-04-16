import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContratoDto {
  @ApiProperty() @IsNumber() productoId?: number;
  @ApiProperty() @IsNumber() clienteId: number;
  @ApiProperty() @IsNumber() inmuebleId: number;
  @ApiProperty() @IsNumber() tipoProductoId: number;
  @ApiProperty() @IsString() @IsNotEmpty() expediente: string;
  @ApiProperty() @IsNumber() periodoCuotaId: number;
  @ApiProperty() @IsNumber() tipoUsoId: number;
  @ApiProperty() @IsString() @IsNotEmpty() fechaPrimeraCuota: string; // DD/MM/YYYY
  @ApiProperty() @IsString() @IsNotEmpty() fechaFirma: string; // DD/MM/YYYY
  @ApiPropertyOptional() @IsOptional() @IsNumber() interesPerial?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tipoBaseCalculo?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() canonArriendo?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() interes?: number;
  @ApiProperty() @IsNumber() region: number;
  @ApiProperty() @IsNumber() montoTotal: number;
  @ApiProperty() @IsNumber() numeroCuotas: number;
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
