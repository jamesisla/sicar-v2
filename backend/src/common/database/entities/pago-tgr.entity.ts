import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('pago_tgr')
export class PagoTgr {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'cupon_id', nullable: true }) cuponId: number;
  @Column({ name: 'id_ext', length: 20, nullable: true }) idExt: string;
  @Column({ length: 20, nullable: true }) status: string;
  @Index({ unique: true })
  @Column({ name: 'id_operacion', length: 50, nullable: true }) idOperacion: string;
  @Column({ name: 'id_transaccion', length: 50, nullable: true }) idTransaccion: string;
  @Column({ nullable: true }) folio: number;
  @Column({ name: 'vencimiento', type: 'date', nullable: true }) vencimiento: Date;
  @Column({ name: 'total_pago', type: 'numeric', precision: 15, scale: 2, nullable: true }) totalPago: number;
  @Column({ name: 'fecha_pago', type: 'timestamp', nullable: true }) fechaPago: Date;
  @Column({ length: 20, nullable: true }) resultado: string;
  @Column({ name: 'tipo_pago', length: 20, nullable: true }) tipoPago: string;
  @Column({ type: 'bigint', nullable: true }) rut: number;
}
