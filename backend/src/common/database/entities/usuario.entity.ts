import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Perfil } from './perfil.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Perfil) @JoinColumn({ name: 'perfil_id' }) perfil: Perfil;
  @Column({ name: 'perfil_id' }) perfilId: number;
  @Column({ length: 50, nullable: true }) nombre: string;
  @Column({ name: 'apellido_paterno', length: 50, nullable: true }) apellidoPaterno: string;
  @Column({ name: 'apellido_materno', length: 50, nullable: true }) apellidoMaterno: string;
  @Column({ name: 'rut', type: 'bigint', nullable: true }) rut: number;
  @Column({ name: 'dv', length: 1, nullable: true }) dv: string;
  @Column({ name: 'region_id', nullable: true }) regionId: number;
  @Column({ name: 'estado', default: 1 }) estado: number;
  @Column({ length: 10, unique: true }) login: string;
  @Column({ length: 255, nullable: true }) password: string;
  @Column({ length: 50, nullable: true }) correo: string;
  @Column({ length: 200, nullable: true }) token: string;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
