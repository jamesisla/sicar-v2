import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estado_producto')
export class EstadoProducto {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) nombre: string;
}
