import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('cupon_pago')
export class CuponPago {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @Column({ name: 'cliente_id', nullable: true }) clienteId: number;
  @Column({ length: 20, nullable: true }) folio: string;
  @CreateDateColumn({ name: 'fch_emision' }) fchEmision: Date;
  @Column({ name: 'fch_carga_pago', type: 'date', nullable: true }) fchCargaPago: Date;
  @Column({ name: 'origen_carga', nullable: true }) origenCarga: number;
  @Column({ name: 'usuario_creacion', nullable: true }) usuarioCreacion: number;
  @Column({ name: 'monto_reajuste', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoReajuste: number;
  @Column({ name: 'monto_interes', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoInteres: number;
  @Column({ name: 'monto_convenio', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoConvenio: number;
  @Column({ name: 'monto_total', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoTotal: number;
  @Column({ name: 'monto_arriendo', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoArriendo: number;
  @Column({ name: 'multa', type: 'numeric', precision: 15, scale: 2, default: 0 }) multa: number;
}
