import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('valor_uf')
export class ValorUf {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'date' }) fecha: Date;
  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true }) valor: number;
}
