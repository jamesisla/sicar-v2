import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('persona')
export class Persona {
  @PrimaryColumn({ name: 'cliente_id' }) clienteId: number;
  @OneToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ type: 'bigint', nullable: true }) rut: number;
  @Column({ length: 1, nullable: true }) dv: string;
  @Column({ length: 50, nullable: true }) nombre: string;
  @Column({ name: 'apellido_paterno', length: 50, nullable: true }) apellidoPaterno: string;
  @Column({ name: 'apellido_materno', length: 50, nullable: true }) apellidoMaterno: string;
  @Column({ length: 50, nullable: true }) profesion: string;
  @Column({ length: 50, nullable: true }) email: string;
  @Column({ length: 1, nullable: true }) sexo: string;
  @Column({ name: 'nacionalidad_id', nullable: true }) nacionalidadId: number;
  @Column({ name: 'estado_civil_id', nullable: true }) estadoCivilId: number;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
