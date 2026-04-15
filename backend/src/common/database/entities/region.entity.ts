import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 4, nullable: true }) numeral: string;
  @Column({ length: 100 }) nombre: string;
  @Column({ name: 'nombre_corto', length: 13, nullable: true }) nombreCorto: string;
}
