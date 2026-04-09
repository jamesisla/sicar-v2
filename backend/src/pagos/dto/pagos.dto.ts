import { IsString, IsNotEmpty, IsNumber, IsArray, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrarAbonoDto {
  @ApiProperty() @IsNumber() ejercicio: number;
  @ApiProperty() @IsString() @IsNotEmpty() unidadSigfe: string;
  @ApiProperty() @IsNumber() tipoMovimiento: number;
  @ApiProperty() @IsString() @IsNotEmpty() fechaContable: string; // DD/MM/YYYY
  @ApiProperty() @IsNumber() codigoRegion: number;
  @ApiProperty() @IsNumber() rutUsuario: number;
  @ApiProperty() @IsString() @IsNotEmpty() dvUsuario: string;
  @ApiProperty() @IsNumber() productoId: number;
  @ApiProperty() @IsArray() cuotas: number[];
}

export class GenerarCuponDto {
  @ApiProperty() @IsNumber() productoId: number;
  @ApiProperty() @IsArray() cuotaIds: number[];
  @ApiProperty() @IsIn(['operador', 'portal', 'banco']) origenCarga: string;
}

export class NotificacionTgrDto {
  @ApiProperty() @IsString() @IsNotEmpty() idOperacion: string;
  @ApiProperty() @IsString() @IsNotEmpty() idTransaccion: string;
  @ApiProperty() @IsNumber() cuponId: number;
  @ApiProperty() @IsNumber() monto: number;
  @ApiProperty() @IsIn(['exitoso', 'fallido']) estado: string;
  @ApiProperty() @IsString() @IsNotEmpty() fechaPago: string;
}

export class CargaBancoDto {
  @ApiProperty() @IsIn(['arriendo', 'venta', 'concesion']) tipo: string;
  @ApiProperty() @IsArray() registros: Array<{ folio: string; fecha: string; monto: number; oficina?: number; fechaContable?: string }>;
}
