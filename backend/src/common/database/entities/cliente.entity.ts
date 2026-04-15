import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoCliente } from './tipo-cliente.entity';
import { Comuna } from './comuna.entity';

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => TipoCliente) @JoinColumn({ name: 'tipo_cliente_id' }) tipoCliente: TipoCliente;
  @Column({ name: 'tipo_cliente_id' }) tipoClienteId: number;
  @Column({ length: 200 }) nombre: string;
  @Column({ type: 'bigint' }) rut: number;
  @Column({ length: 1 }) dv: string;
  @Column({ name: 'fono_contacto', length: 50, nullable: true }) fonoContacto: string;
  @Column({ name: 'mail_contacto', length: 50, nullable: true }) mailContacto: string;
  @Column({ name: 'ingreso_mes', type: 'numeric', precision: 15, nullable: true }) ingresoMes: number;
  @Column({ name: 'nombre_calle', length: 300, nullable: true }) nombreCalle: string;
  @Column({ name: 'numero_calle', length: 10, nullable: true }) numeroCalle: string;
  @Column({ length: 5, nullable: true }) depto: string;
  @Column({ length: 5, nullable: true }) block: string;
  @Column({ name: 'villa_localidad', length: 50, nullable: true }) villaLocalidad: string;
  @Column({ length: 20, nullable: true }) fax: string;
  @Column({ length: 255, nullable: true }) password: string;
  @ManyToOne(() => Comuna, { nullable: true }) @JoinColumn({ name: 'comuna_id' }) comuna: Comuna;
  @Column({ name: 'comuna_id', nullable: true }) comunaId: number;
  @UpdateDateColumn({ name: 'fch_actualizada' }) fchActualizada: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
