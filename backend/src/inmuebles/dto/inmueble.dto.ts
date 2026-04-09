import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInmuebleDto {
  @ApiProperty() @IsNumber() regionId: number;
  @ApiProperty() @IsNumber() tipoUrbanoId: number;
  @ApiProperty() @IsNumber() tipoInmuebleId: number;
  @ApiProperty() @IsNumber() comunaId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rolSii?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() carpeta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() porcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() plano?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() superficieConstruida?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() superficieTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() avaluoFiscal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tasacionComercial?: number;
  @ApiProperty() @IsString() @IsNotEmpty() nombreCalle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroCalle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() block?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deptoOficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() villaLocalidad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conservador?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fojas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroInscripcion?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() agnoInscripcion?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() idCatastral?: string;
}
