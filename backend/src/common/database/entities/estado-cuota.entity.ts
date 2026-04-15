import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_cuota')
export class EstadoCuota {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) nombre: string;
}
