import { Request, Response } from 'express';
import { EventWaitingListService } from '../services/event_waiting_list.service';

const service = new EventWaitingListService();

/**
 * POST /api/waiting-list — registro desde la app (usuario autenticado).
 * Los datos personales salen del usuario del token; dispara el mismo
 * email de confirmación que el registro público de la web.
 */
export const registerWaitingListAuthenticated = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { event_id, locality_id, qty_requested } = req.body;

    const entry = await service.register({
      event_id,
      locality_id: locality_id ?? null,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number ?? '',
      qty_requested,
    });

    res.status(201).json({ entry });
  } catch (error: any) {
    console.error('Error in registerWaitingListAuthenticated:', error);
    if (error.message.includes('ya está registrado')) {
      return res.status(409).json({ error: 'Conflict', message: error.message });
    }
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Error al registrar en lista de espera' });
  }
};

export const getWaitingListByEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId as string);
    const list = await service.getByEvent(eventId, req.user!.id, req.user!.role);
    res.status(200).json({ list });
  } catch (error: any) {
    console.error('Error in getWaitingListByEvent:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    if (error.message.includes('permiso')) {
      return res.status(403).json({ error: 'Forbidden', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Error al obtener lista de espera' });
  }
};

export const getWaitingListByLocality = async (req: Request, res: Response) => {
  try {
    const localityId = parseInt(req.params.localityId as string);
    const list = await service.getByLocality(localityId);
    res.status(200).json({ list });
  } catch (error: any) {
    console.error('Error in getWaitingListByLocality:', error);
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Error al obtener lista de espera' });
  }
};

export const removeFromWaitingList = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await service.remove(id);
    res.status(200).json({ message: 'Registro eliminado de la lista de espera' });
  } catch (error: any) {
    console.error('Error in removeFromWaitingList:', error);
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Error al eliminar de lista de espera' });
  }
};
