import { EventWaitingListRepository } from '../repositories/event_waiting_list.repository';
import { NotificationMessageQueueService } from './notificationmessagequeue.service';
import { BrevoService } from './brevo.service';
import { EMAIL_TEMPLATES } from '../templates/email-templates';
import { prisma } from '../prisma/client';

const repo = new EventWaitingListRepository();
const emailQueue = new NotificationMessageQueueService();
const brevoService = new BrevoService();

export class EventWaitingListService {

  async register(data: {
    event_id: number;
    locality_id?: number | null;
    name: string;
    last_name: string;
    email: string;
    phone_number: string;
    qty_requested?: number;
  }) {
    const event = await prisma.event.findUnique({ where: { id: data.event_id } });
    if (!event) throw new Error('Evento no encontrado');

    let localityName: string | null = null;
    if (data.locality_id) {
      const locality = await prisma.eventLocalities.findUnique({ where: { id: data.locality_id } });
      if (!locality || locality.event_id !== data.event_id) {
        throw new Error('Localidad no encontrada para este evento');
      }
      localityName = locality.name_locality;
    }

    const existing = await repo.findByEventAndEmail(data.event_id, data.email);
    if (existing) throw new Error('Este email ya está registrado en la lista de espera de este evento');

    const entry = await repo.create(data);

    // Confirmación por email — fire-and-forget, no bloquea la respuesta
    this._sendConfirmationEmail(entry, event.name, event.date_event, localityName);

    return entry;
  }

  /**
   * Email de confirmación de lista de espera.
   * Si el email pertenece a un usuario registrado → cola (con reintentos);
   * si no → envío directo por Brevo.
   */
  private _sendConfirmationEmail(
    entry: { name: string; last_name: string; email: string; qty_requested?: number | null },
    eventName: string,
    eventDate: Date,
    localityName: string | null
  ): void {
    const task = async () => {
      const qty = entry.qty_requested ?? 1;
      const dateStr = eventDate.toLocaleDateString('es-CO', {
        timeZone: 'America/Bogota',
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      const eventDateLabel = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      const variables = {
        user_name: `${entry.name} ${entry.last_name}`.trim(),
        event_name: eventName,
        event_date: eventDateLabel,
        qty_label: `${qty} ${qty === 1 ? 'boleta' : 'boletas'}`,
        locality_name: localityName ?? '',
      };

      const user = await prisma.user.findFirst({
        where: { email: { equals: entry.email, mode: 'insensitive' } },
        select: { id: true },
      });

      if (user) {
        await emailQueue.queueEmail({
          userId: user.id,
          email: entry.email,
          templateCode: 'WAITING_LIST_CONFIRM',
          variables,
        });
      } else {
        const template = EMAIL_TEMPLATES['WAITING_LIST_CONFIRM'];
        await brevoService.sendEmail({
          to: { email: entry.email, name: variables.user_name },
          subject: template.subject(variables),
          htmlContent: template.html(variables),
        });
      }

      console.log('📧 Confirmación de lista de espera enviada a:', entry.email);
    };

    task().catch((err) => {
      console.error('⚠️ Error enviando confirmación de lista de espera:', err.message);
    });
  }

  async getByEvent(eventId: number, requesterId: number, requesterRole: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Evento no encontrado');

    const isOwner = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('No tienes permiso para ver esta lista');

    return repo.findByEventId(eventId);
  }

  async getByLocality(localityId: number) {
    const locality = await prisma.eventLocalities.findUnique({ where: { id: localityId } });
    if (!locality) throw new Error('Localidad no encontrada');
    return repo.findByLocalityId(localityId);
  }

  async remove(id: number) {
    const entry = await prisma.eventWaitingList.findUnique({ where: { id } });
    if (!entry) throw new Error('Registro no encontrado en lista de espera');
    await repo.delete(id);
  }
}
