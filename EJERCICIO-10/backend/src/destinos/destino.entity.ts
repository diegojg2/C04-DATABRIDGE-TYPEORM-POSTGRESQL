import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('destinos')
export class Destino {
  @PrimaryGeneratedColumn() id: number;
  @Column() ciudad: string;
  @Column() pais: string;
  @Column() descripcion: string;

  // MEJORA: 1 = baja, 2 = media, 3 = alta (se guarda como número para poder ordenar)
  @Column('int', { default: 2 }) prioridad: number;

  // MEJORA: si ya hemos visitado el destino
  @Column({ default: false }) visitado: boolean;
}