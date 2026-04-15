import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('empresa')
export class Empresa {
  @PrimaryColumn({ name: 'cliente_id' }) clienteId: number;
  @OneToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ name: 'razon_social', length: 200, nullable: true }) razonSocial: string;
  @Column({ length: 75, nullable: true }) giro: string;
  @Column({ name: 'rut_rep_legal', type: 'bigint', nullable: true }) rutRepLegal: number;
  @Column({ name: 'dv_rep_legal', length: 1, nullable: true }) dvRepLegal: string;
  @Column({ name: 'nombre_rep_legal', length: 50, nullable: true }) nombreRepLegal: string;
  @Column({ name: 'apellido_paterno_rep', length: 50, nullable: true }) apellidoPaternoRep: string;
  @Column({ name: 'apellido_materno_rep', length: 50, nullable: true }) apellidoMaternoRep: string;
}
