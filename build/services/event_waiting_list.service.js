"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventWaitingListService = void 0;
const event_waiting_list_repository_1 = require("../repositories/event_waiting_list.repository");
const notificationmessagequeue_service_1 = require("./notificationmessagequeue.service");
const brevo_service_1 = require("./brevo.service");
const email_templates_1 = require("../templates/email-templates");
const client_1 = require("../prisma/client");
const repo = new event_waiting_list_repository_1.EventWaitingListRepository();
const emailQueue = new notificationmessagequeue_service_1.NotificationMessageQueueService();
const brevoService = new brevo_service_1.BrevoService();
class EventWaitingListService {
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield client_1.prisma.event.findUnique({ where: { id: data.event_id } });
            if (!event)
                throw new Error('Evento no encontrado');
            let localityName = null;
            if (data.locality_id) {
                const locality = yield client_1.prisma.eventLocalities.findUnique({ where: { id: data.locality_id } });
                if (!locality || locality.event_id !== data.event_id) {
                    throw new Error('Localidad no encontrada para este evento');
                }
                localityName = locality.name_locality;
            }
            const existing = yield repo.findByEventAndEmail(data.event_id, data.email);
            if (existing)
                throw new Error('Este email ya está registrado en la lista de espera de este evento');
            const entry = yield repo.create(data);
            // Confirmación por email — fire-and-forget, no bloquea la respuesta
            this._sendConfirmationEmail(entry, event.name, event.date_event, localityName);
            return entry;
        });
    }
    /**
     * Email de confirmación de lista de espera.
     * Si el email pertenece a un usuario registrado → cola (con reintentos);
     * si no → envío directo por Brevo.
     */
    _sendConfirmationEmail(entry, eventName, eventDate, localityName) {
        const task = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const qty = (_a = entry.qty_requested) !== null && _a !== void 0 ? _a : 1;
            const dateStr = eventDate.toLocaleDateString('es-CO', {
                timeZone: 'America/Bogota',
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            });
            const eventDateLabel = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            const variables = {
                user_name: entry.name.trim(),
                event_name: eventName,
                event_date: eventDateLabel,
                qty_label: `${qty} ${qty === 1 ? 'boleta' : 'boletas'}`,
                locality_name: localityName !== null && localityName !== void 0 ? localityName : '',
            };
            const user = yield client_1.prisma.user.findFirst({
                where: { email: { equals: entry.email, mode: 'insensitive' } },
                select: { id: true },
            });
            if (user) {
                yield emailQueue.queueEmail({
                    userId: user.id,
                    email: entry.email,
                    templateCode: 'WAITING_LIST_CONFIRM',
                    variables,
                });
            }
            else {
                const template = email_templates_1.EMAIL_TEMPLATES['WAITING_LIST_CONFIRM'];
                yield brevoService.sendEmail({
                    to: { email: entry.email, name: variables.user_name },
                    subject: template.subject(variables),
                    htmlContent: template.html(variables),
                });
            }
            console.log('📧 Confirmación de lista de espera enviada a:', entry.email);
        });
        task().catch((err) => {
            console.error('⚠️ Error enviando confirmación de lista de espera:', err.message);
        });
    }
    getByEvent(eventId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield client_1.prisma.event.findUnique({ where: { id: eventId } });
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permiso para ver esta lista');
            return repo.findByEventId(eventId);
        });
    }
    getByLocality(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const locality = yield client_1.prisma.eventLocalities.findUnique({ where: { id: localityId } });
            if (!locality)
                throw new Error('Localidad no encontrada');
            return repo.findByLocalityId(localityId);
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = yield client_1.prisma.eventWaitingList.findUnique({ where: { id } });
            if (!entry)
                throw new Error('Registro no encontrado en lista de espera');
            yield repo.delete(id);
        });
    }
}
exports.EventWaitingListService = EventWaitingListService;
