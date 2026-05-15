import { WebBlockType } from '@prisma/client';
import { WebBlocksRepository } from '../repositories/web_blocks.repository';
import { prisma } from '../prisma/client';

const repo = new WebBlocksRepository();

export class WebBlocksService {

  // ── WebBlockIndex ──────────────────────────────────────────────────────────

  async getAll(countryId?: number) {
    return repo.findAll(countryId);
  }

  async getById(id: number) {
    const block = await repo.findById(id);
    if (!block) throw new Error('Bloque no encontrado');
    return block;
  }

  async create(data: {
    country_id: number;
    title: string;
    type: WebBlockType;
    block_order?: number;
    block_identifier: string;
    block_config?: any;
    block_active?: number;
    banner_img?: string;
    banner_text?: string;
    banner_link?: string;
  }) {
    const country = await prisma.countries.findUnique({ where: { id: data.country_id } });
    if (!country) throw new Error('País no encontrado');

    const existing = await prisma.webBlockIndex.findUnique({
      where: { block_identifier: data.block_identifier },
    });
    if (existing) throw new Error(`El identificador '${data.block_identifier}' ya está en uso`);

    return repo.create(data);
  }

  async update(
    id: number,
    data: {
      country_id?: number;
      title?: string;
      type?: WebBlockType;
      block_order?: number;
      block_identifier?: string;
      block_config?: any | null;
      block_active?: number;
      banner_img?: string | null;
      banner_text?: string | null;
      banner_link?: string | null;
    }
  ) {
    const block = await repo.findById(id);
    if (!block) throw new Error('Bloque no encontrado');

    if (data.country_id) {
      const country = await prisma.countries.findUnique({ where: { id: data.country_id } });
      if (!country) throw new Error('País no encontrado');
    }

    if (data.block_identifier) {
      const duplicate = await prisma.webBlockIndex.findFirst({
        where: { block_identifier: data.block_identifier, id: { not: id } },
      });
      if (duplicate) throw new Error(`El identificador '${data.block_identifier}' ya está en uso`);
    }

    return repo.update(id, data);
  }

  async delete(id: number) {
    const block = await repo.findById(id);
    if (!block) throw new Error('Bloque no encontrado');
    await repo.delete(id);
  }

  // ── WebBlockEvents ─────────────────────────────────────────────────────────

  async addEvent(blockId: number, eventId: number) {
    const block = await repo.findById(blockId);
    if (!block) throw new Error('Bloque no encontrado');

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Evento no encontrado');

    const existing = await repo.findBlockEvent(blockId, eventId);
    if (existing) throw new Error('El evento ya está en este bloque');

    return repo.addEvent(blockId, eventId);
  }

  async removeEvent(blockId: number, eventId: number) {
    const block = await repo.findById(blockId);
    if (!block) throw new Error('Bloque no encontrado');

    const existing = await repo.findBlockEvent(blockId, eventId);
    if (!existing) throw new Error('El evento no está en este bloque');

    await repo.removeEvent(blockId, eventId);
  }

  // ── WebBlockSlideImgs ──────────────────────────────────────────────────────

  async addSlide(blockId: number, imageUrl: string, eventId?: number | null) {
    const block = await repo.findById(blockId);
    if (!block) throw new Error('Bloque no encontrado');

    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento no encontrado');
    }

    return repo.addSlide({ block_id: blockId, image_url: imageUrl, event_id: eventId ?? null });
  }

  async updateSlide(blockId: number, slideId: number, data: { image_url?: string; event_id?: number | null }) {
    const slide = await repo.findSlide(slideId);
    if (!slide || slide.block_id !== blockId) throw new Error('Slide no encontrado en este bloque');

    if (data.event_id) {
      const event = await prisma.event.findUnique({ where: { id: data.event_id } });
      if (!event) throw new Error('Evento no encontrado');
    }

    return repo.updateSlide(slideId, data);
  }

  async removeSlide(blockId: number, slideId: number) {
    const slide = await repo.findSlide(slideId);
    if (!slide || slide.block_id !== blockId) throw new Error('Slide no encontrado en este bloque');
    await repo.removeSlide(slideId);
  }
}
