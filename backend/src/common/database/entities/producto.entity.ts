import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Cliente } from './cliente.entity';
import { Inmueble } from './inmueble.entity';
import { EstadoProducto } from './estado-producto.entity';
import { TipoProducto } from './tipo-producto.entity';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => EstadoProducto) @JoinColumn({ name: 'estado_producto_id' }) estadoProducto: EstadoProducto;
  @Column({ name: 'estado_producto_id' }) estadoProductoId: number;
  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @Column({ name: 'cliente_id' }) clienteId: number;
  @ManyToOne(() => Inmueble) @JoinColumn({ name: 'inmueble_id' }) inmueble: Inmueble;
  @Column({ name: 'inmueble_id' }) inmuebleId: number;
  @ManyToOne(() => TipoProducto) @JoinColumn({ name: 'tipo_producto_id' }) tipoProducto: TipoProducto;
  @Column({ name: 'tipo_producto_id' }) tipoProductoId: number;
  @Column({ name: 'fch_inicio', type: 'date', nullable: true }) fchInicio: Date;
  @Column({ name: 'fch_termino', type: 'date', nullable: true }) fchTermino: Date;
  @Column({ name: 'numero_cuotas', nullable: true }) numeroCuotas: number;
  @Column({ name: 'prid_resolucion', nullable: true }) pridResolucion: number;
  @Column({ name: 'region_id' }) regionId: number;
  @Column({ name: 'monto_total', type: 'numeric', precision: 15, scale: 2, default: 0 }) montoTotal: number;
  @Column({ name: 'renta_variable', length: 2, nullable: true }) rentaVariable: string;
  @Column({ name: 'aviso_correo', nullable: true }) avisoCorreo: number;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
