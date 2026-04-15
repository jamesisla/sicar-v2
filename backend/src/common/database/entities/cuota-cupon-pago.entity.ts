import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CuponPago } from './cupon-pago.entity';

@Entity('cuota_cupon_pago')
export class CuotaCuponPago {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => CuponPago) @JoinColumn({ name: 'cupon_pago_id' }) cuponPago: CuponPago;
  @Column({ name: 'cupon_pago_id' }) cuponPagoId: number;
  @Column({ name: 'producto_id' }) productoId: number;
  @Column({ name: 'cuota_id' }) cuotaId: number;
  @Column({ name: 'tipo_mov_id', nullable: true }) tipoMovId: number;
  @Column({ length: 20, nullable: true }) folio: string;
  @Column({ name: 'monto', type: 'numeric', precision: 15, scale: 2, default: 0 }) monto: number;
}
