import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Cliente } from './cliente.entity';
import { Comuna } from './comuna.entity';

@Entity('domicilio')
export class Domicilio {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ name: 'cliente_id' }) clienteId: number;
  @ManyToOne(() => Comuna) @JoinColumn({ name: 'comuna_id' }) comuna: Comuna;
  @Column({ name: 'comuna_id' }) comunaId: number;
  @Column({ length: 50, nullable: true }) calle: string;
  @Column({ length: 5, nullable: true }) block: string;
  @Column({ name: 'depto_oficina', length: 5, nullable: true }) deptoOficina: string;
  @Column({ name: 'villa_localidad', length: 45, nullable: true }) villaLocalidad: string;
  @CreateDateColumn({ name: 'fch_creacion' }) fchCreacion: Date;
  @Column({ name: 'usuario_creacion', nullable: true }) usuarioCreacion: number;
}
