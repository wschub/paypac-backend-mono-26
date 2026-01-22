import { EventStaffAssignmentRepository } from '../repositories/event_staff_assignment.repository';
import { EventRepository } from '../repositories/event.repository';
import { UserRepository } from '../repositories/user.repository';

const staffAssignmentRepo = new EventStaffAssignmentRepository();
const eventRepo = new EventRepository();
const userRepo = new UserRepository();

export class EventStaffAssignmentService {
  /**
   * Asignar un STAFF a un evento
   * Solo ORGANIZER (dueño del evento) o PAYPAC pueden asignar
   */
  async assignStaffToEvent(
    eventId: number,
    staffUserId: number,
    roleType: 'STAFF' | 'STAFF_PROMOTER',
    assignedByUserId: number,
    assignedByUserRole: string
  ) {
    // Verificar que el evento existe
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar permisos: Solo el ORGANIZER dueño o PAYPAC pueden asignar
    const isOwner = event.organizer_id === assignedByUserId;
    const isPaypac = assignedByUserRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('Solo el organizador del evento o PAYPAC pueden asignar staff');
    }

    // Verificar que el usuario a asignar existe
    const staffUser = await userRepo.findById(staffUserId);
    if (!staffUser) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el usuario tenga un rol válido para ser STAFF
    const validRoles = ['STAFF', 'STAFF_PROMOTER', 'PAYPAC'];
    if (!validRoles.includes(staffUser.role)) {
      throw new Error(`El usuario debe tener rol STAFF, STAFF_PROMOTER o PAYPAC. Rol actual: ${staffUser.role}`);
    }

    // Verificar que no esté ya asignado
    const alreadyAssigned = await staffAssignmentRepo.isStaffAssignedToEvent(staffUserId, eventId);
    if (alreadyAssigned) {
      throw new Error('Este usuario ya está asignado a este evento');
    }

    // Crear la asignación
    const assignment = await staffAssignmentRepo.create({
      event_id: eventId,
      user_id: staffUserId,
      role_type: roleType,
      assigned_by: assignedByUserId,
    });

    return {
      assignment,
      message: 'Staff asignado exitosamente al evento',
    };
  }

  /**
   * Obtener todos los STAFF asignados a un evento
   */
  async getEventStaff(eventId: number, userId: number, userRole: string) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Solo el ORGANIZER dueño, STAFF del evento o PAYPAC pueden ver la lista
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';
    const isStaff = await staffAssignmentRepo.isStaffAssignedToEvent(userId, eventId);

    if (!isOwner && !isPaypac && !isStaff) {
      throw new Error('No tienes permisos para ver el staff de este evento');
    }

    return staffAssignmentRepo.findByEvent(eventId);
  }

  /**
   * Obtener eventos asignados a un STAFF
   */
  async getMyAssignedEvents(userId: number) {
    return staffAssignmentRepo.findByUser(userId);
  }

  /**
   * Remover STAFF de un evento
   */
  async removeStaffFromEvent(
    eventId: number,
    staffUserId: number,
    removedByUserId: number,
    removedByUserRole: string
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Solo el ORGANIZER dueño o PAYPAC pueden remover
    const isOwner = event.organizer_id === removedByUserId;
    const isPaypac = removedByUserRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('Solo el organizador del evento o PAYPAC pueden remover staff');
    }

    // Verificar que la asignación existe
    const assignment = await staffAssignmentRepo.findByUserAndEvent(staffUserId, eventId);
    if (!assignment) {
      throw new Error('Esta asignación no existe');
    }

    await staffAssignmentRepo.deleteByUserAndEvent(staffUserId, eventId);

    return {
      message: 'Staff removido del evento exitosamente',
    };
  }

  /**
   * Check-in de STAFF en el evento
   * El STAFF registra su llegada al evento
   */
  async checkInStaff(
    userId: number,
    eventId: number,
    latitude?: string,
    longitude?: string
  ) {
    // Verificar que el STAFF está asignado al evento
    const assignment = await staffAssignmentRepo.findByUserAndEvent(userId, eventId);
    if (!assignment) {
      throw new Error('No estás asignado a este evento');
    }

    // Verificar que el evento esté activo o próximo
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const now = new Date();
    const eventDate = new Date(event.date_event);
    const hoursBeforeEvent = 4; // Permitir check-in 4 horas antes
    const minCheckInTime = new Date(eventDate.getTime() - hoursBeforeEvent * 60 * 60 * 1000);

    if (now < minCheckInTime) {
      throw new Error('Aún no puedes hacer check-in. El evento no ha iniciado.');
    }

    // TODO FASE 2: Validar geolocalización
    // Verificar que el STAFF esté cerca del lugar del evento
    // if (latitude && longitude) {
    //   const eventLat = parseFloat(event.latitude);
    //   const eventLng = parseFloat(event.longitude);
    //   const distance = calculateDistance(eventLat, eventLng, parseFloat(latitude), parseFloat(longitude));
    //   
    //   if (distance > 0.5) { // 500 metros de radio
    //     throw new Error('Debes estar en el lugar del evento para hacer check-in');
    //   }
    // }

    const checkedIn = await staffAssignmentRepo.checkIn(userId, eventId, latitude, longitude);

    return {
      assignment: checkedIn,
      message: 'Check-in exitoso. Ya puedes validar tickets.',
    };
  }

  /**
   * Check-out de STAFF del evento
   */
  async checkOutStaff(userId: number, eventId: number) {
    const assignment = await staffAssignmentRepo.findByUserAndEvent(userId, eventId);
    if (!assignment) {
      throw new Error('No estás asignado a este evento');
    }

    if (!assignment.checked_in) {
      throw new Error('No has hecho check-in en este evento');
    }

    const checkedOut = await staffAssignmentRepo.checkOut(userId, eventId);

    return {
      assignment: checkedOut,
      message: 'Check-out exitoso.',
    };
  }

  /**
   * Verificar si un STAFF puede validar tickets de un evento
   * Esta función se usa en ticket.service.ts al validar tickets
   */
  async canStaffValidateTickets(userId: number, eventId: number): Promise<boolean> {
    const assignment = await staffAssignmentRepo.findByUserAndEvent(userId, eventId);
    
    // Debe estar asignado y haber hecho check-in
    return !!(assignment && assignment.checked_in);
  }

  /**
   * Obtener estadísticas de STAFF de un evento
   */
  async getEventStaffStats(eventId: number, userId: number, userRole: string) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver estas estadísticas');
    }

    const allStaff = await staffAssignmentRepo.findByEvent(eventId);
    const checkedIn = await staffAssignmentRepo.findCheckedInByEvent(eventId);

    return {
      total: allStaff.length,
      checked_in: checkedIn.length,
      not_checked_in: allStaff.length - checkedIn.length,
      by_role: {
        STAFF: allStaff.filter(s => s.role_type === 'STAFF').length,
        STAFF_PROMOTER: allStaff.filter(s => s.role_type === 'STAFF_PROMOTER').length,
      },
    };
  }
}
