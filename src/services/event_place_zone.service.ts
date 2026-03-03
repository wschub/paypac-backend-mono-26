import { EventPlaceZoneRepository } from '../repositories/event_place_zone.repository';
import { EventPlacesRepository } from '../repositories/event_places.repository';

const zoneRepo  = new EventPlaceZoneRepository();
const placesRepo = new EventPlacesRepository();

export class EventPlaceZoneService {
  /**
   * Crear zona dentro de un lugar — solo PAYPAC
   */
  async createZone(
    data: { name: string; capacity: number; place_id: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear zonas');

    const place = await placesRepo.findById(data.place_id);
    if (!place) throw new Error(`Lugar con ID ${data.place_id} no encontrado`);

    const existing = await zoneRepo.findByNameAndPlace(data.name, data.place_id);
    if (existing)
      throw new Error(`Ya existe la zona "${data.name}" en el lugar "${place.name_place}"`);

    return zoneRepo.create({
      name: data.name,
      capacity: data.capacity,
      place: { connect: { id: data.place_id } },
    });
  }

  /**
   * Zonas de un lugar — roles internos
   */
  async getZonesByPlace(place_id: number) {
    const place = await placesRepo.findById(place_id);
    if (!place) throw new Error(`Lugar con ID ${place_id} no encontrado`);
    return zoneRepo.findAll(place_id);
  }

  /**
   * Zona por ID — roles internos
   */
  async getZoneById(id: number) {
    const zone = await zoneRepo.findById(id);
    if (!zone) throw new Error('Zona no encontrada');
    return zone;
  }

  /**
   * Actualizar zona — solo PAYPAC
   */
  async updateZone(
    id: number,
    data: { name?: string; capacity?: number },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede actualizar zonas');

    const zone = await zoneRepo.findById(id);
    if (!zone) throw new Error('Zona no encontrada');

    if (data.name) {
      const existing = await zoneRepo.findByNameAndPlace(data.name, zone.place_id);
      if (existing && existing.id !== id)
        throw new Error(`Ya existe otra zona con el nombre "${data.name}" en este lugar`);
    }

    return zoneRepo.update(id, data);
  }

  /**
   * Eliminar zona — solo PAYPAC
   * Valida que no tenga filas asociadas
   */
  async deleteZone(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar zonas');

    const zone = await zoneRepo.findById(id);
    if (!zone) throw new Error('Zona no encontrada');

    const counts = (zone as any)._count;
    if (counts?.rows > 0)
      throw new Error(
        `No se puede eliminar: la zona tiene ${counts.rows} fila(s). Elimínalas primero.`
      );

    return zoneRepo.delete(id);
  }
}