import { Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { EVENT_STATUS } from '@prisma/client';

const eventService = new EventService();

/**
 * POST /api/events
 * Crear un nuevo evento (ORGANIZER, PAYPAC)
 */
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const data = req.body;

    const event = await eventService.createEvent(data, user.id, user.role);

    res.status(201).json({
      message: 'Evento creado exitosamente',
      event,
    });
  } catch (err: any) {
    console.error('❌ Error en createEvent:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events
 * Listar eventos con filtros opcionales
 */
export const getEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const rawStatus = req.query.status as string | undefined;

const filters = {
  status: rawStatus
    ? rawStatus.includes(',')
      ? (rawStatus.split(',') as EVENT_STATUS[])
      : (rawStatus as EVENT_STATUS)
    : undefined,
  event_type: req.query.event_type as string | undefined,
  category_id: req.query.category_id
    ? Number(req.query.category_id)
    : undefined,
  country: req.query.country as string | undefined,
  city: req.query.city as string | undefined,
  search: req.query.search as string | undefined,
  allow_external_promoters: req.query.allow_external_promoters !== undefined  // ← agregar
    ? req.query.allow_external_promoters === 'true'
    : undefined,
};

    const events = await eventService.getEvents(
      filters,
      user.role,
      user.id
    );

    res.status(200).json({
      total: events.length,
      events,
    });
  } catch (err: any) {
    console.error('❌ Error en getEvents:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/:id
 * Obtener un evento por ID
 */
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const event = await eventService.getEventById(id);

    res.status(200).json(event);
  } catch (err: any) {
    console.error('❌ Error en getEventById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/events/my-events
 * Obtener eventos del organizador autenticado
 */
export const getMyEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const events = await eventService.getMyEvents(user.id);

    res.status(200).json({
      total: events.length,
      events,
    });
  } catch (err: any) {
    console.error('❌ Error en getMyEvents:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/events/:id
 * Actualizar un evento (solo dueño o PAYPAC)
 */
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const data = req.body;

    const updatedEvent = await eventService.updateEvent(
      id,
      data,
      user.id,
      user.role
    );

    res.status(200).json({
      message: 'Evento actualizado exitosamente',
      event: updatedEvent,
    });
  } catch (err: any) {
    console.error('❌ Error en updateEvent:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/events/:id
 * Eliminar un evento (solo dueño o PAYPAC)
 */
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);

    await eventService.deleteEvent(id, user.id, user.role);

    res.status(200).json({
      message: 'Evento eliminado exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteEvent:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * PATCH /api/events/:id/status
 * Actualizar el status de un evento (solo PAYPAC)
 */
export const updateEventStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const updatedEvent = await eventService.updateEventStatus(
      id,
      status,
      user.role
    );

    res.status(200).json({
      message: `Status del evento actualizado a ${status}`,
      event: updatedEvent,
    });
  } catch (err: any) {
    console.error('❌ Error en updateEventStatus:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/organizer/stats
 * Obtener estadísticas de eventos del organizador
 */
export const getOrganizerStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const stats = await eventService.getOrganizerStats(user.id);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getOrganizerStats:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/promoter-available
 * Eventos disponibles para promotores externos
 * con resumen de ventas del promotor autenticado
 */
export const getAvailableEventsForPromoter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const events = await eventService.getAvailableEventsForPromoter(user.id);

    res.status(200).json({
      total: events.length,
      events,
    });
  } catch (err: any) {
    console.error('❌ Error en getAvailableEventsForPromoter:', err);
    res.status(500).json({ error: err.message });
  }
};