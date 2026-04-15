import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_cobranza')
export class TipoCobranza {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) nombre: string;
}
