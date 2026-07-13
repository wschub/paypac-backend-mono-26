import { prisma } from '../prisma/client';
import { WebBlockType } from '@prisma/client';

// ─── WebBlockIndex ────────────────────────────────────────────────────────────

export class WebBlocksRepository {

  // Incluye eventos y slides anidados en cada bloque
  private readonly fullInclude = {
    country: { select: { id: true, name_country: true, code: true } },
    events: {
      include: {
        event: {
          select: {
            id: true,
            public_id: true,
            public_url: true,
            name: true,
            image: true,
            cover: true,
            short_description: true,
            date_event: true,
            place_address: true,
            status: true,
            featured: true,
          },
        },
      },
    },
    slides: {
      include: {
        event: {
          select: {
            id: true,
            public_id: true,
            public_url: true,
            name: true,
          },
        },
      },
    },
  } as const;

  // ── Index ──────────────────────────────────────────────────────────────────

  async findAll(countryId?: number) {
    return prisma.webBlockIndex.findMany({
      where: {
        block_active: 1,
        ...(countryId ? { country_id: countryId } : {}),
      },
      include: this.fullInclude,
      orderBy: { block_order: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.webBlockIndex.findUnique({
      where: { id },
      include: this.fullInclude,
    });
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
    return prisma.webBlockIndex.create({
      data,
      include: this.fullInclude,
    });
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
    return prisma.webBlockIndex.update({
      where: { id },
      data,
      include: this.fullInclude,
    });
  }

  async delete(id: number) {
    return prisma.webBlockIndex.delete({ where: { id } });
  }

  // ── WebBlockEvents ─────────────────────────────────────────────────────────

  async addEvent(blockId: number, eventId: number) {
    return prisma.webBlockEvents.create({
      data: { block_id: blockId, event_id: eventId },
      include: {
        event: {
          select: {
            id: true, public_id: true, public_url: true,
            name: true, image: true, cover: true,
            short_description: true, date_event: true, status: true,
          },
        },
      },
    });
  }

  async removeEvent(blockId: number, eventId: number) {
    return prisma.webBlockEvents.deleteMany({
      where: { block_id: blockId, event_id: eventId },
    });
  }

  async findBlockEvent(blockId: number, eventId: number) {
    return prisma.webBlockEvents.findUnique({
      where: { block_id_event_id: { block_id: blockId, event_id: eventId } },
    });
  }

  // ── WebBlockSlideImgs ──────────────────────────────────────────────────────

  async addSlide(data: { block_id: number; image_url: string; event_id?: number | null }) {
    return prisma.webBlockSlideImgs.create({
      data,
      include: {
        event: { select: { id: true, public_id: true, public_url: true, name: true } },
      },
    });
  }

  async updateSlide(slideId: number, data: { image_url?: string; event_id?: number | null }) {
    return prisma.webBlockSlideImgs.update({
      where: { id: slideId },
      data,
      include: {
        event: { select: { id: true, public_id: true, public_url: true, name: true } },
      },
    });
  }

  async removeSlide(slideId: number) {
    return prisma.webBlockSlideImgs.delete({ where: { id: slideId } });
  }

  async findSlide(slideId: number) {
    return prisma.webBlockSlideImgs.findUnique({ where: { id: slideId } });
  }

  // Todos los slides en plano (para el dashboard), con su bloque y evento
  async findAllSlides() {
    return prisma.webBlockSlideImgs.findMany({
      include: {
        block: { select: { id: true, title: true, block_identifier: true } },
        event: { select: { id: true, public_id: true, public_url: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  // Todos los bloques (sin filtro de activo) con eventos y slides — para el dashboard,
  // ordenados por block_order (id como desempate para orden estable)
  async findAllFull() {
    return prisma.webBlockIndex.findMany({
      include: this.fullInclude,
      orderBy: [{ block_order: 'asc' }, { id: 'asc' }],
    });
  }

  // Todos los bloques (sin filtro de activo) — datos básicos para selects del dashboard
  async findAllBlocksBasic() {
    return prisma.webBlockIndex.findMany({
      select: {
        id: true,
        title: true,
        block_identifier: true,
        type: true,
        block_active: true,
        country_id: true,
      },
      orderBy: { block_order: 'asc' },
    });
  }
}
