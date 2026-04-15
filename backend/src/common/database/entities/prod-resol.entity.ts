import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';
import { Resolucion } from './resolucion.entity';

@Entity('prod_resol')
export class ProdResol {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Resolucion) @JoinColumn({ name: 'resolucion_id' }) resolucion: Resolucion;
  @Column({ name: 'resolucion_id' }) resolucionId: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @Column({ name: 'tipo_accion', nullable: true }) tipoAccion: number;
  @Column({ name: 'causal_termino', length: 200, nullable: true }) causaTermino: string;
  @Column({ name: 'monto_adeudado', type: 'numeric', precision: 15, scale: 2, nullable: true }) montoAdeudado: number;
  @Column({ name: 'fch_resolucion', type: 'date', nullable: true }) fchResolucion: Date;
}
