import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ name: 'cliente_id' }) clienteId: number;
  @Column({ length: 100, nullable: true }) nombre: string;
  @Column({ name: 'cargo_relacion', length: 45, nullable: true }) cargoRelacion: string;
  @Column({ length: 45, nullable: true }) email: string;
  @Column({ name: 'numero_fijo', type: 'bigint', nullable: true }) numeroFijo: number;
  @Column({ name: 'numero_movil', type: 'bigint', nullable: true }) numeroMovil: number;
}
