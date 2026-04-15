import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_movimiento')
export class TipoMovimiento {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 50 }) nombre: string;
  @Column({ name: 'cuenta_cargo', length: 10, nullable: true }) cuentaCargo: string;
  @Column({ name: 'cuenta_abono', length: 10, nullable: true }) cuentaAbono: string;
  @Column({ length: 200, nullable: true }) observacion: string;
  @Column({ name: 'cta_banco', length: 15, nullable: true }) ctaBanco: string;
}
