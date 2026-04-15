import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('adjunto_producto')
export class AdjuntoProducto {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @Column({ name: 'tipo_adjunto_id' }) tipoAdjuntoId: number;
  @Column({ length: 100, nullable: true }) nombre: string;
  @Column({ length: 50, nullable: true }) ruta: string;
  @Column({ default: 1 }) estado: number;
  @CreateDateColumn({ name: 'fch_subida' }) fchSubida: Date;
  @Column({ name: 'usuario', nullable: true }) usuario: number;
  @Column({ name: 'nro_oficio_cde', nullable: true }) nroOficioCde: number;
}
