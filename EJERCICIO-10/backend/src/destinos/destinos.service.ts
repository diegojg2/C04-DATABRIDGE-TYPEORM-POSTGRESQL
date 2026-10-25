import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Destino } from './destino.entity.js';
import { CreateDestinoDto } from './create-destino.dto.js';
import { UpdateDestinoDto } from './update-destino.dto.js';

@Injectable()
export class DestinosService {
  constructor(@InjectRepository(Destino) private readonly repository: Repository<Destino>) {}

  // MEJORA: filtro opcional + orden por pendientes y prioridad
  findAll(soloPendientes = false) {
    const where: FindOptionsWhere<Destino> = {};
    if (soloPendientes) where.visitado = false;

    return this.repository.find({
      where,
      order: { visitado: 'ASC', prioridad: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const x = await this.repository.findOneBy({ id });
    if (!x) throw new NotFoundException('Destino no encontrado');
    return x;
  }

  create(dto: CreateDestinoDto) {
    this.validarPrioridad(dto.prioridad);
    return this.repository.save(this.repository.create(dto));
  }

  async update(id: number, dto: UpdateDestinoDto) {
    this.validarPrioridad(dto.prioridad);
    const x = await this.findOne(id);
    this.repository.merge(x, dto);
    return this.repository.save(x);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  // MEJORA: regla de negocio, la prioridad solo puede ser 1, 2 o 3
  private validarPrioridad(prioridad?: number) {
    if (prioridad !== undefined && ![1, 2, 3].includes(prioridad)) {
      throw new BadRequestException('La prioridad debe ser 1, 2 o 3');
    }
  }
}