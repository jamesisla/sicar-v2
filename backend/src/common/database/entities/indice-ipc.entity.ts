import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('indice_ipc')
export class IndiceIpc {
  @PrimaryGeneratedColumn() id: number;
  @Column() mes: number;
  @Column() agno: number;
  @Column({ name: 'valor_indice', type: 'numeric', precision: 5, scale: 2, nullable: true }) valorIndice: number;
  @Column({ type: 'numeric', precision: 6, scale: 3, nullable: true }) variacion: number;
}
