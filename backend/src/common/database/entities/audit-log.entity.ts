import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn() id: number;
  @CreateDateColumn({ name: 'fch_operacion' }) fchOperacion: Date;
  @Column({ name: 'usuario_id', nullable: true }) usuarioId: number;
  @Column({ length: 50 }) entidad: string;
  @Column({ name: 'id_registro', length: 100 }) idRegistro: string;
  @Column({ length: 10 }) operacion: string;
  @Column({ name: 'valor_anterior', type: 'text', nullable: true }) valorAnterior: string;
  @Column({ name: 'valor_nuevo', type: 'text', nullable: true }) valorNuevo: string;
  @Column({ name: 'ip_cliente', length: 45, nullable: true }) ipCliente: string;
  @Column({ length: 200, nullable: true }) endpoint: string;
}
