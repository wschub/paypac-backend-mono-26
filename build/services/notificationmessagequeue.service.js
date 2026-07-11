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
exports.NotificationMessageQueueService = void 0;
const notificationmessagequeue_repository_1 = require("../repositories/notificationmessagequeue.repository");
const brevo_service_1 = require("./brevo.service");
const email_templates_1 = require("../templates/email-templates");
const messageRepo = new notificationmessagequeue_repository_1.NotificationMessageQueueRepository();
const brevoService = new brevo_service_1.BrevoService();
class NotificationMessageQueueService {
    /**
     * Encolar un nuevo mensaje para envío
     */
    queueEmail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Obtener template estático
            const template = email_templates_1.EMAIL_TEMPLATES[params.templateCode];
            if (!template) {
                throw new Error(`Template "${params.templateCode}" no encontrado`);
            }
            // 2. Validar variables requeridas
            const missingVars = template.requiredVariables.filter(v => !(v in params.variables));
            if (missingVars.length > 0) {
                throw new Error(`Faltan variables: ${missingVars.join(', ')}`);
            }
            // 3. Renderizar subject y HTML
            const emailSubject = template.subject(params.variables);
            const emailBody = template.html(params.variables);
            // 4. Guardar en cola
            const message = yield messageRepo.create({
                user_id: params.userId,
                template_code: params.templateCode,
                email_delivery: params.email,
                email_subject: emailSubject,
                email_body: emailBody,
                send_at: params.sendAt || null,
                status: 0,
            });
            console.log('✅ Email encolado:', {
                id: message.id,
                to: params.email,
                template: params.templateCode,
            });
            return message;
        });
    }
    /**
     * Procesar mensajes pendientes (llamado por CRON)
     */
    processPendingMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingMessages = yield messageRepo.findPendingMessages();
            console.log(`📧 Procesando ${pendingMessages.length} mensaje(s) pendiente(s)...`);
            const results = { sent: 0, failed: 0, total: pendingMessages.length };
            for (const message of pendingMessages) {
                try {
                    const result = yield brevoService.sendEmail({
                        to: {
                            email: message.email_delivery,
                            name: message.user.name || 'Usuario',
                        },
                        subject: message.email_subject,
                        htmlContent: message.email_body,
                    });
                    if (result.success) {
                        yield messageRepo.updateStatus(message.id, 1, `Enviado: ${result.messageId}`);
                        results.sent++;
                    }
                    else {
                        yield messageRepo.updateStatus(message.id, 2, `Error: ${result.error}`);
                        results.failed++;
                    }
                }
                catch (error) {
                    console.error(`❌ Error procesando mensaje ${message.id}:`, error);
                    yield messageRepo.updateStatus(message.id, 2, `Excepción: ${error.message}`);
                    results.failed++;
                }
            }
            console.log('📊 Resumen:', results);
            return results;
        });
    }
    /**
     * Obtener mensajes del usuario
     */
    getUserMessages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return messageRepo.findByUserId(userId);
        });
    }
    /**
     * Obtener mensaje por ID
     */
    getMessageById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield messageRepo.findById(id);
            if (!message) {
                throw new Error('Mensaje no encontrado');
            }
            return message;
        });
    }
    /**
     * Reintentar mensaje fallido
     */
    retryMessage(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede reintentar mensajes');
            }
            const message = yield messageRepo.findById(id);
            if (!message) {
                throw new Error('Mensaje no encontrado');
            }
            if (message.status !== 2) {
                throw new Error('Solo se pueden reintentar mensajes fallidos');
            }
            yield messageRepo.updateStatus(id, 0, 'Reintento manual');
            return { message: 'Mensaje marcado para reintento', id };
        });
    }
    /**
     * Eliminar mensaje
     */
    deleteMessage(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar mensajes');
            }
            const message = yield messageRepo.findById(id);
            if (!message) {
                throw new Error('Mensaje no encontrado');
            }
            return messageRepo.delete(id);
        });
    }
    /**
     * Estadísticas de la cola
     */
    getQueueStats(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            const countsByStatus = yield messageRepo.countByStatus();
            return {
                pending: countsByStatus[0] || 0,
                sent: countsByStatus[1] || 0,
                failed: countsByStatus[2] || 0,
                total: Object.values(countsByStatus).reduce((a, b) => a + b, 0),
            };
        });
    }
    /**
     * Limpiar mensajes antiguos
     */
    cleanOldMessages(daysOld, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede limpiar mensajes antiguos');
            }
            const deletedCount = yield messageRepo.cleanOldMessages(daysOld);
            return {
                message: `Se eliminaron ${deletedCount} mensaje(s) antiguo(s)`,
                deleted: deletedCount,
            };
        });
    }
}
exports.NotificationMessageQueueService = NotificationMessageQueueService;
