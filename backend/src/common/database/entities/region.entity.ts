import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 4, nullable: true }) numeral: string;
  @Column({ length: 100 }) nombre: string;
  @Column({ length: 13, nullable: true }) nombreCorto: string;
}
