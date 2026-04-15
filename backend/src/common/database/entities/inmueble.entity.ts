import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Region } from './region.entity';
import { Comuna } from './comuna.entity';

@Entity('inmueble')
export class Inmueble {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Region) @JoinColumn({ name: 'region_id' }) region: Region;
  @Column({ name: 'region_id' }) regionId: number;
  @ManyToOne(() => Comuna) @JoinColumn({ name: 'comuna_id' }) comuna: Comuna;
  @Column({ name: 'comuna_id' }) comunaId: number;
  @Column({ name: 'tipo_urbano_id', nullable: true }) tipoUrbanoId: number;
  @Column({ name: 'tipo_inmueble_id', nullable: true }) tipoInmuebleId: number;
  @Column({ name: 'rol_sii', length: 50, nullable: true }) rolSii: string;
  @Column({ length: 10, nullable: true }) carpeta: string;
  @Column({ length: 5, nullable: true }) porcion: string;
  @Column({ length: 500, nullable: true }) plano: string;
  @Column({ name: 'superficie_construida', type: 'numeric', precision: 15, nullable: true }) superficieConstruida: number;
  @Column({ name: 'superficie_total', type: 'numeric', precision: 15, nullable: true }) superficieTotal: number;
  @Column({ name: 'avaluo_fiscal', type: 'numeric', precision: 15, nullable: true }) avaluoFiscal: number;
  @Column({ name: 'tasacion_comercial', type: 'numeric', precision: 15, nullable: true }) tasacionComercial: number;
  @Column({ name: 'nombre_calle', length: 300, nullable: true }) nombreCalle: string;
  @Column({ name: 'numero_calle', length: 10, nullable: true }) numeroCalle: string;
  @Column({ length: 5, nullable: true }) block: string;
  @Column({ name: 'depto_oficina', length: 5, nullable: true }) deptoOficina: string;
  @Column({ name: 'villa_localidad', length: 80, nullable: true }) villaLocalidad: string;
  @Column({ length: 75, nullable: true }) conservador: string;
  @Column({ length: 15, nullable: true }) fojas: string;
  @Column({ name: 'numero_inscripcion', length: 15, nullable: true }) numeroInscripcion: string;
  @Column({ name: 'agno_inscripcion', nullable: true }) agnoInscripcion: number;
  @Column({ name: 'id_catastral', length: 100, nullable: true }) idCatastral: string;
  @Column({ default: 1 }) estado: number;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
