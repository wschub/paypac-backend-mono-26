import { EventPlacesRepository } from '../repositories/event_places.repository';
import { Prisma, TypePlaces, Places } from '@prisma/client';

const placesRepo = new EventPlacesRepository();

export class EventPlacesService {
  /**
   * Crear un lugar — solo PAYPAC
   */
  async createPlace(
    data: {
      name_place: string;
      type_place: TypePlaces;
      place_type: Places;
      capacity: number;
      map_place?: any;
    },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear lugares');

    const existing = await placesRepo.findByName(data.name_place);
    if (existing) throw new Error(`Ya existe un lugar con el nombre "${data.name_place}"`);

    return placesRepo.create(data as Prisma.EventPlacesCreateInput);
  }

  /**
   * Listar lugares — roles internos
   */
  async getPlaces(filters?: {
    search?: string;
    type_place?: TypePlaces;
    place_type?: Places;
  }) {
    return placesRepo.findAll(filters);
  }

  /**
   * Lugar por ID con zonas — roles internos
   */
  async getPlaceById(id: number) {
    const place = await placesRepo.findById(id);
    if (!place) throw new Error('Lugar no encontrado');
    return place;
  }

  /**
   * Layout completo zones → rows → seats — PAYPAC y ORGANIZER
   */
  async getPlaceWithFullLayout(id: number) {
    const place = await placesRepo.findByIdWithFullLayout(id);
    if (!place) throw new Error('Lugar no encontrado');
    return place;
  }

  /**
   * Actualizar lugar — solo PAYPAC
   */
  async updatePlace(id: number, data: Prisma.EventPlacesUpdateInput, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede actualizar lugares');

    const place = await placesRepo.findById(id);
    if (!place) throw new Error('Lugar no encontrado');

    if (data.name_place && typeof data.name_place === 'string') {
      const existing = await placesRepo.findByName(data.name_place);
      if (existing && existing.id !== id)
        throw new Error(`Ya existe otro lugar con el nombre "${data.name_place}"`);
    }

    return placesRepo.update(id, data);
  }

  /**
   * Actualizar solo el JSON del mapa — solo PAYPAC
   */
  async updateMap(id: number, map_place: any, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede actualizar el mapa');

    const place = await placesRepo.findById(id);
    if (!place) throw new Error('Lugar no encontrado');

    return placesRepo.update(id, { map_place });
  }

  /**
   * Eliminar lugar — solo PAYPAC
   * Valida que no tenga zonas ni eventos asociados
   */
  async deletePlace(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar lugares');

    const place = await placesRepo.findById(id);
    if (!place) throw new Error('Lugar no encontrado');

    const counts = (place as any)._count;
    if (counts?.events > 0)
      throw new Error(
        `No se puede eliminar: el lugar está asociado a ${counts.events} evento(s)`
      );
    if (counts?.zones > 0)
      throw new Error(
        `No se puede eliminar: el lugar tiene ${counts.zones} zona(s). Elimínalas primero.`
      );

    return placesRepo.delete(id);
  }
}