import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaNaturalDto {
  @ApiProperty() @IsNumber() rut: number;
  @ApiProperty() @IsString() @IsNotEmpty() dv: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() apellidoPaterno: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apellidoMaterno?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() profesion?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefono?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sexo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() nacionalidad?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() estadoCivil?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() rentaMensual?: number;
}

export class CreatePersonaJuridicaDto {
  @ApiProperty() @IsNumber() rut: number;
  @ApiProperty() @IsString() @IsNotEmpty() dv: string;
  @ApiProperty() @IsString() @IsNotEmpty() razonSocial: string;
  @ApiPropertyOptional() @IsOptional() @IsString() giro?: string;
  @ApiProperty() @IsNumber() repLegalRut: number;
  @ApiProperty() @IsString() @IsNotEmpty() repLegalDv: string;
  @ApiProperty() @IsString() @IsNotEmpty() repLegalNombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() repLegalApellidoPaterno: string;
  @ApiPropertyOptional() @IsOptional() @IsString() repLegalApellidoMaterno?: string;
}

export class UpdateClienteDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fonoContacto?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() mailContacto?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() ingresoMes?: number;
  // Persona natural
  @ApiPropertyOptional() @IsOptional() @IsString() profesion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sexo?: string;
  // Empresa
  @ApiPropertyOptional() @IsOptional() @IsString() giro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() repLegalNombre?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() repLegalApellidoPaterno?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() repLegalRut?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() repLegalDv?: string;
}

export class AddDomicilioDto {
  @ApiProperty() @IsNumber() comunaId: number;
  @ApiProperty() @IsString() @IsNotEmpty() calle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() block?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deptoOficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() villaLocalidad?: string;
}

export class AddContactoDto {
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cargoRelacion?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numeroFijo?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numeroMovil?: number;
}
