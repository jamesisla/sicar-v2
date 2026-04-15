import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('fiscalizacion')
export class Fiscalizacion {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Producto) @JoinColumn({ name: 'producto_id' }) producto: Producto;
  @Column({ name: 'producto_id' }) productoId: number;
  @Column({ name: 'tipo_fiscalizacion_id', nullable: true }) tipoFiscalizacionId: number;
  @Column({ name: 'fch_fiscalizacion', type: 'date', nullable: true }) fchFiscalizacion: Date;
  @Column({ name: 'nombre_fiscalizador', length: 50, nullable: true }) nombreFiscalizador: string;
  @Column({ name: 'apellido_paterno', length: 50, nullable: true }) apellidoPaterno: string;
  @Column({ length: 300, nullable: true }) observacion: string;
  @UpdateDateColumn({ name: 'fch_actualiza' }) fchActualiza: Date;
  @Column({ name: 'usuario_actualiza', nullable: true }) usuarioActualiza: number;
}
