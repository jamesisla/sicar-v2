import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('resolucion')
export class Resolucion {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'tipo_resolucion_id', nullable: true }) tipoResolucionId: number;
  @Column({ name: 'anio_resolucion', nullable: true }) anioResolucion: number;
  @Column({ name: 'fch_tramite', type: 'date', nullable: true }) fchTramite: Date;
  @Column({ name: 'fch_resolucion', type: 'date', nullable: true }) fchResolucion: Date;
  @Column({ name: 'numero_resolucion', length: 10, nullable: true }) numeroResolucion: string;
  @Column({ length: 200, nullable: true }) adjunto: string;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
