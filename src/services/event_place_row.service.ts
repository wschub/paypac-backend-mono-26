import { EventPlaceRowRepository } from '../repositories/event_place_row.repository';
import { EventPlaceZoneRepository } from '../repositories/event_place_zone.repository';

const rowRepo  = new EventPlaceRowRepository();
const zoneRepo = new EventPlaceZoneRepository();

export class EventPlaceRowService {
  /**
   * Crear fila dentro de una zona — solo PAYPAC
   */
  async createRow(data: { name: string; zone_id: number }, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear filas');

    const zone = await zoneRepo.findById(data.zone_id);
    if (!zone) throw new Error(`Zona con ID ${data.zone_id} no encontrada`);

    const existing = await rowRepo.findByNameAndZone(data.name, data.zone_id);
    if (existing)
      throw new Error(`Ya existe la fila "${data.name}" en la zona "${zone.name}"`);

    return rowRepo.create({
      name: data.name,
      zone: { connect: { id: data.zone_id } },
    });
  }

  /**
   * Filas de una zona — roles internos
   */
  async getRowsByZone(zone_id: number) {
    const zone = await zoneRepo.findById(zone_id);
    if (!zone) throw new Error(`Zona con ID ${zone_id} no encontrada`);
    return rowRepo.findAll(zone_id);
  }

  /**
   * Fila por ID con sillas — roles internos
   */
  async getRowById(id: number) {
    const row = await rowRepo.findById(id);
    if (!row) throw new Error('Fila no encontrada');
    return row;
  }

  /**
   * Actualizar fila — solo PAYPAC
   */
  async updateRow(id: number, data: { name?: string }, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede actualizar filas');

    const row = await rowRepo.findById(id);
    if (!row) throw new Error('Fila no encontrada');

    if (data.name) {
      const existing = await rowRepo.findByNameAndZone(data.name, row.zone_id);
      if (existing && existing.id !== id)
        throw new Error(`Ya existe otra fila "${data.name}" en esta zona`);
    }

    return rowRepo.update(id, data);
  }

  /**
   * Eliminar fila — solo PAYPAC
   * Valida que no tenga sillas asociadas
   */
  async deleteRow(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar filas');

    const row = await rowRepo.findById(id);
    if (!row) throw new Error('Fila no encontrada');

    const counts = (row as any)._count;
    if (counts?.seats > 0)
      throw new Error(
        `No se puede eliminar: la fila tiene ${counts.seats} silla(s). Elimínalas primero.`
      );

    return rowRepo.delete(id);
  }
}