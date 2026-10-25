export class CreateDestinoDto {
  ciudad: string;
  pais: string;
  descripcion: string;
  prioridad?: number; // MEJORA: opcional, si no llega vale 2 (media)
}