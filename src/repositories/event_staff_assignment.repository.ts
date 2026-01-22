import { prisma } from '../config/db';
import { EventStaffAssignment, Prisma } from '@prisma/client';

export class EventStaffAssignmentRepository {
  /**
   * Asignar un STAFF a un evento
   */
  async create(data: Prisma.EventStaffAssignmentUncheckedCreateInput): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.create({
      data,
      include: {
        event: true,
        user: true,
        assignedBy: true,
      },
    });
  }

  /**
   * Buscar asignación por ID
   */
  async findById(id: number): Promise<EventStaffAssignment | null> {
    return prisma.eventStaffAssignment.findUnique({
      where: { id },
      include: {
        event: true,
        user: true,
        assignedBy: true,
      },
    });
  }

  /**
   * Verificar si un usuario está asignado a un evento
   */
  async isStaffAssignedToEvent(userId: number, eventId: number): Promise<boolean> {
    const assignment = await prisma.eventStaffAssignment.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });
    return !!assignment;
  }

  /**
   * Obtener asignación específica (usuario + evento)
   */
  async findByUserAndEvent(userId: number, eventId: number): Promise<EventStaffAssignment | null> {
    return prisma.eventStaffAssignment.findUnique({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  /**
   * Obtener todos los staff asignados a un evento
   */
  async findByEvent(eventId: number): Promise<EventStaffAssignment[]> {
    return prisma.eventStaffAssignment.findMany({
      where: { event_id: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            last_name: true,
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  /**
   * Obtener todos los eventos asignados a un STAFF
   */
  async findByUser(userId: number): Promise<EventStaffAssignment[]> {
    return prisma.eventStaffAssignment.findMany({
      where: { user_id: userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date_event: true,
            place_address: true,
            status: true,
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  /**
   * Actualizar asignación (para check-in, geolocalización, etc.)
   */
  async update(id: number, data: Prisma.EventStaffAssignmentUpdateInput): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.update({
      where: { id },
      data,
    });
  }

  /**
   * Check-in de STAFF en el evento (registra ubicación)
   */
  async checkIn(
    userId: number,
    eventId: number,
    latitude?: string,
    longitude?: string
  ): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.update({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      data: {
        checked_in: true,
        checked_in_at: new Date(),
        latitude,
        longitude,
      },
    });
  }

  /**
   * Check-out de STAFF (marca como no presente)
   */
  async checkOut(userId: number, eventId: number): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.update({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      data: {
        checked_in: false,
        latitude: null,
        longitude: null,
      },
    });
  }

  /**
   * Eliminar asignación (remover STAFF de evento)
   */
  async delete(id: number): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.delete({
      where: { id },
    });
  }

  /**
   * Eliminar por usuario y evento
   */
  async deleteByUserAndEvent(userId: number, eventId: number): Promise<EventStaffAssignment> {
    return prisma.eventStaffAssignment.delete({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });
  }

  /**
   * Verificar si existe una asignación
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventStaffAssignment.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar STAFF asignados a un evento
   */
  async countByEvent(eventId: number): Promise<number> {
    return prisma.eventStaffAssignment.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Contar eventos asignados a un STAFF
   */
  async countByUser(userId: number): Promise<number> {
    return prisma.eventStaffAssignment.count({
      where: { user_id: userId },
    });
  }

  /**
   * Obtener STAFF que están checked-in en un evento
   */
  async findCheckedInByEvent(eventId: number): Promise<EventStaffAssignment[]> {
    return prisma.eventStaffAssignment.findMany({
      where: {
        event_id: eventId,
        checked_in: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }
}
