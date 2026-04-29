import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInmuebleDto {
  @ApiProperty() @Type(() => Number) @IsNumber() regionId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() tipoUrbanoId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() tipoInmuebleId: number;
  @ApiProperty() @Type(() => Number) @IsNumber() comunaId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rolSii?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carpeta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() porcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() plano?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() superficieConstruida?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() superficieTotal?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() avaluoFiscal?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() tasacionComercial?: number;
  @ApiProperty() @IsString() @IsNotEmpty() nombreCalle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroCalle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() block?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deptoOficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() villaLocalidad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conservador?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fojas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroInscripcion?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() agnoInscripcion?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() idCatastral?: string;
}

export class UpdateInmuebleDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() comunaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rolSii?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carpeta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() porcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() superficieConstruida?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() superficieTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() avaluoFiscal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tasacionComercial?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() nombreCalle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroCalle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() block?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deptoOficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() villaLocalidad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conservador?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fojas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroInscripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() agnoInscripcion?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() idCatastral?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estado?: number;
}
