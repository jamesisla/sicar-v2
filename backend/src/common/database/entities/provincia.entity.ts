import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Region } from './region.entity';

@Entity('provincia')
export class Provincia {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) nombre: string;
  @ManyToOne(() => Region) @JoinColumn({ name: 'region_id' }) region: Region;
  @Column({ name: 'region_id' }) regionId: number;
}
