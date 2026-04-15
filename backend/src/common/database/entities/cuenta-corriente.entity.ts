import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { TipoMovimiento } from './tipo-movimiento.entity';

@Entity('cuenta_corriente')
export class CuentaCorriente {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @ManyToOne(() => TipoMovimiento) @JoinColumn({ name: 'tipo_movimiento_id' }) tipoMovimiento: TipoMovimiento;
  @Column({ name: 'tipo_movimiento_id' }) tipoMovimientoId: number;
  @Column({ name: 'cargo_abono', nullable: true }) cargoAbono: number;
  @Column({ name: 'fch_movimiento', type: 'date', nullable: true }) fchMovimiento: Date;
  @Column({ name: 'monto_mov', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoMov: number;
  @Column({ name: 'centralizado_sigfe', default: 0 }) centralizadoSigfe: number;
  @Column({ name: 'fch_contable', type: 'date', nullable: true }) fchContable: Date;
  @Column({ name: 'id_cuota', nullable: true }) idCuota: number;
  @Column({ name: 'id_cliente', nullable: true }) idCliente: number;
  @Column({ name: 'anio_asiento', nullable: true }) anioAsiento: number;
  @Column({ name: 'id_asiento_sigfe', nullable: true }) idAsientoSigfe: number;
  @CreateDateColumn({ name: 'fch_creacion' }) fchCreacion: Date;
  @Column({ name: 'usuario_creacion', nullable: true }) usuarioCreacion: number;
}
