import { Request, Response } from 'express';
import { EventStaffAssignmentService } from '../services/event_staff_assignment.service';

const staffAssignmentService = new EventStaffAssignmentService();

/**
 * POST /api/events/:eventId/staff
 * Asignar un STAFF a un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const assignStaffToEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { staff_user_id, role_type } = req.body;
    const assignedBy = req.user!;

    const result = await staffAssignmentService.assignStaffToEvent(
      eventId,
      staff_user_id,
      role_type,
      assignedBy.id,
      assignedBy.role
    );

    res.status(201).json({
      success: true,
      message: result.message,
      assignment: result.assignment,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/events/:eventId/staff
 * Obtener todos los STAFF asignados a un evento
 * Requiere: ORGANIZER (dueño), STAFF del evento, o PAYPAC
 */
export const getEventStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const user = req.user!;

    const staff = await staffAssignmentService.getEventStaff(eventId, user.id, user.role);

    res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/staff/my-events
 * Obtener eventos asignados al STAFF autenticado
 * Requiere: STAFF, STAFF_PROMOTER
 */
export const getMyAssignedEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const events = await staffAssignmentService.getMyAssignedEvents(userId);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE /api/events/:eventId/staff/:staffUserId
 * Remover un STAFF de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const removeStaffFromEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const staffUserId = parseInt(req.params.staffUserId);
    const removedBy = req.user!;

    const result = await staffAssignmentService.removeStaffFromEvent(
      eventId,
      staffUserId,
      removedBy.id,
      removedBy.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/events/:eventId/staff/check-in
 * Check-in del STAFF en el evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
export const checkInStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user!.id;
    const { latitude, longitude } = req.body;

    const result = await staffAssignmentService.checkInStaff(
      userId,
      eventId,
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      message: result.message,
      assignment: result.assignment,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/events/:eventId/staff/check-out
 * Check-out del STAFF del evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
export const checkOutStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user!.id;

    const result = await staffAssignmentService.checkOutStaff(userId, eventId);

    res.status(200).json({
      success: true,
      message: result.message,
      assignment: result.assignment,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/events/:eventId/staff/stats
 * Obtener estadísticas de STAFF del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const getEventStaffStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const user = req.user!;

    const stats = await staffAssignmentService.getEventStaffStats(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
