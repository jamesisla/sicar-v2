import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Cobranza } from './cobranza.entity';

@Entity('carta_aviso')
export class CartaAviso {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Cobranza) @JoinColumn({ name: 'cobranza_id' }) cobranza: Cobranza;
  @Column({ name: 'cobranza_id' }) cobranzaId: number;
  @Column({ name: 'numero_aviso' }) numeroAviso: number;
  @Column({ name: 'fch_aviso', type: 'date', nullable: true }) fchAviso: Date;
  @Column({ name: 'usuario_aviso', nullable: true }) usuarioAviso: number;
}
