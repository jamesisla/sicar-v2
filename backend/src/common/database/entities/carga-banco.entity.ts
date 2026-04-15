import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('carga_banco')
export class CargaBanco {
  @PrimaryGeneratedColumn() id: number;
  @Index({ unique: true })
  @Column({ length: 20 }) folio: string;
  @Column({ type: 'date', nullable: true }) fecha: Date;
  @Column({ nullable: true }) oficina: number;
  @Column({ name: 'carga_pago', nullable: true }) cargaPago: number;
  @Column({ name: 'fch_contable', type: 'date', nullable: true }) fchContable: Date;
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 }) monto: number;
  @Column({ default: false }) exito: boolean;
  @Column({ name: 'tipo_cartera', length: 20, default: 'arriendo' }) tipoCartera: string;
  @Column({ name: 'fch_actualiza', type: 'timestamp', nullable: true }) fchActualiza: Date;
}
