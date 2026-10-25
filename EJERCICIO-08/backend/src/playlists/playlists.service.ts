import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity.js';
import { Cancion } from './cancion.entity.js';
import { CreateCancionDto } from './create-cancion.dto.js';

@Injectable()
export class PlaylistsService implements OnModuleInit {
  constructor(
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(Cancion) private readonly canciones: Repository<Cancion>,
  ) {}

  async onModuleInit() {
    if (await this.playlists.count() === 0) {
      const playlist = await this.playlists.save(
        this.playlists.create({ nombre: 'Entrenamiento' }),
      );
      await this.canciones.save(
        this.canciones.create({
          titulo: 'Run Boy Run',
          artista: 'Woodkid',
          playlist,
        }),
      );
    }
  }

  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlists.findOne({
      where: { id },
      relations: { canciones: true },
      order: { canciones: { id: 'ASC' } }, 
    });
    if (!playlist) throw new NotFoundException('Playlist no encontrada');
    return playlist;
  }

  // RETO: crear una Canción asociada a una Playlist existente
  async addCancion(dto: CreateCancionDto): Promise<Playlist> {
    // 1. Buscamos primero el padre: sin Playlist no hay Canción
    const playlist = await this.playlists.findOneBy({ id: dto.playlistId });
    if (!playlist) throw new NotFoundException('Playlist no encontrada');

    // 2. Creamos la hija enlazada al padre (TypeORM rellena la clave foránea)
    const cancion = this.canciones.create({
      titulo: dto.titulo,
      artista: dto.artista,
      playlist,
    });
    await this.canciones.save(cancion);

    // 3. Devolvemos la playlist recargada con sus canciones
    return this.findOne(playlist.id);
  }
}