import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Region } from './region.entity';
import { Provincia } from './provincia.entity';

@Entity('comuna')
export class Comuna {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) nombre: string;
  @ManyToOne(() => Region) @JoinColumn({ name: 'region_id' }) region: Region;
  @Column({ name: 'region_id' }) regionId: number;
  @ManyToOne(() => Provincia) @JoinColumn({ name: 'provincia_id' }) provincia: Provincia;
  @Column({ name: 'provincia_id' }) provinciaId: number;
}
