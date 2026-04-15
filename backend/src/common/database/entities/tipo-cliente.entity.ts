import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_cliente')
export class TipoCliente {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) descripcion: string;
}
