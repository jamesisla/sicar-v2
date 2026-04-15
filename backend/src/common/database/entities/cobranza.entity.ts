import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { TipoCobranza } from './tipo-cobranza.entity';

@Entity('cobranza')
export class Cobranza {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @ManyToOne(() => TipoCobranza) @JoinColumn({ name: 'tipo_cobranza_id' }) tipoCobranza: TipoCobranza;
  @Column({ name: 'tipo_cobranza_id' }) tipoCobranzaId: number;
  @Column({ name: 'fch_cobranza', type: 'date', nullable: true }) fchCobranza: Date;
  @Column({ name: 'monto_cobrado', type: 'numeric', precision: 15, default: 0 }) montoCobrado: number;
  @Column({ default: 0 }) estado: number;
  @Column({ name: 'cuotas_id', nullable: true }) cuotasId: number;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
