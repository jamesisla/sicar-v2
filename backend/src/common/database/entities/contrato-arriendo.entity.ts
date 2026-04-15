import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('contrato_arriendo')
export class ContratoArriendo {
  @PrimaryColumn({ name: 'producto_id' }) productoId: number;
  @OneToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'periodo_cuota_id', nullable: true }) periodoCuotaId: number;
  @Column({ name: 'tipo_uso_id', nullable: true }) tipoUsoId: number;
  @Column({ name: 'fch_primera_cuota', type: 'date', nullable: true }) fchPrimeraCuota: Date;
  @Column({ name: 'interes_penal', type: 'numeric', precision: 8, scale: 3, default: 0 }) interesPerial: number;
  @Column({ name: 'fch_firma', type: 'date', nullable: true }) fchFirma: Date;
  @Column({ name: 'notificacion_cliente', type: 'date', nullable: true }) notificacionCliente: Date;
  @Column({ name: 'aceptacion_cliente', nullable: true }) aceptacionCliente: number;
  @Column({ name: 'tipo_base_calculo_id', nullable: true }) tipoBaseCalculoId: number;
  @Column({ name: 'aviso', nullable: true }) aviso: number;
  @Column({ name: 'canon_arriendo', type: 'numeric', precision: 15, scale: 2, default: 0 }) canonArriendo: number;
  @Column({ name: 'interes', type: 'numeric', precision: 8, scale: 3, default: 0 }) interes: number;
  @Column({ name: 'numero_expediente', length: 30, nullable: true }) numeroExpediente: string;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
