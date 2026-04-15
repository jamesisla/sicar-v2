import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { EstadoCuota } from './estado-cuota.entity';

@Entity('cuota')
export class Cuota {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @ManyToOne(() => EstadoCuota) @JoinColumn({ name: 'estado_cuota_id' }) estadoCuota: EstadoCuota;
  @Column({ name: 'estado_cuota_id' }) estadoCuotaId: number;
  @Column({ name: 'fch_vencimiento', type: 'date' }) fchVencimiento: Date;
  @Column({ name: 'fch_reavaluo', type: 'date', nullable: true }) fchReavaluo: Date;
  @Column({ name: 'aviso_cobranza', nullable: true }) avisoCobranza: number;
  @Column({ name: 'monto', type: 'numeric', precision: 15, scale: 2, default: 0 }) monto: number;
  @Column({ name: 'monto_reavaluo', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoReavaluo: number;
  @Column({ name: 'cargo_reavaluo', type: 'numeric', precision: 15, scale: 2, default: 0 }) cargoReavaluo: number;
  @Column({ name: 'cargo_interes', type: 'numeric', precision: 15, scale: 2, default: 0 }) cargoInteres: number;
  @Column({ name: 'cargo_convenio', type: 'numeric', precision: 15, scale: 2, default: 0 }) cargoConvenio: number;
  @Column({ name: 'abono_pago', type: 'numeric', precision: 15, scale: 2, default: 0 }) abonoPago: number;
  @Column({ name: 'abono_convenio', type: 'numeric', precision: 15, scale: 2, default: 0 }) abonoConvenio: number;
  @Column({ name: 'multa', type: 'numeric', precision: 15, scale: 2, default: 0 }) multa: number;
  @Column({ name: 'prorroga', default: false }) prorroga: boolean;
  @Column({ name: 'fch_pago', type: 'date', nullable: true }) fchPago: Date;
  @CreateDateColumn({ name: 'fch_creacion' }) fchCreacion: Date;
  @Column({ name: 'usuario_creacion', nullable: true }) usuarioCreacion: number;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
