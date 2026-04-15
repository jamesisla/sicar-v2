import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('interes_penal')
export class InteresPenal {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'ip_mes' }) mes: number;
  @Column({ name: 'ip_year' }) agno: number;
  @Column({ name: 'interes_a', type: 'numeric', precision: 5, scale: 2, nullable: true }) interesA: number;
  @Column({ name: 'interes_b', type: 'numeric', precision: 5, scale: 2, nullable: true }) interesB: number;
  @Column({ name: 'interes_c', type: 'numeric', precision: 5, scale: 2, nullable: true }) interesC: number;
}
