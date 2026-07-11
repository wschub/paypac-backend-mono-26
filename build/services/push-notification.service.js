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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
/**
 * Servicio para enviar notificaciones push con Firebase Cloud Messaging
 */
class PushNotificationService {
    /**
     * Enviar notificación de tickets creados
     */
    sendTicketsCreatedNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de tickets creados...');
                console.log('   FCM Token:', fcmToken.substring(0, 20) + '...');
                console.log('   Invoice:', data.numInvoice);
                console.log('   Tickets:', data.ticketCount);
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '🎉 ¡Tus tickets están listos!',
                        body: `${data.ticketCount} ticket${data.ticketCount > 1 ? 's' : ''} para ${data.eventName}`,
                    },
                    data: {
                        type: 'tickets_created',
                        invoice_id: data.invoiceId.toString(),
                        num_invoice: data.numInvoice,
                        event_id: data.eventId.toString(),
                        ticket_count: data.ticketCount.toString(),
                        click_action: 'FLUTTER_NOTIFICATION_CLICK',
                        route: '/wallet', // Para navegación en Flutter
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'tickets',
                            sound: 'default',
                            color: '#0031FB',
                            icon: 'ic_notification',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default',
                                badge: 1,
                            },
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification enviada exitosamente');
                console.log('   Response:', response);
                return {
                    success: true,
                    messageId: response,
                };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                // Si el token es inválido, no es un error crítico
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    console.warn('⚠️ Token FCM inválido o no registrado. Usuario debe actualizar el token.');
                    return {
                        success: false,
                        error: 'invalid_token',
                    };
                }
                return {
                    success: false,
                    error: error.message,
                };
            }
        });
    }
    /**
     * Enviar notificación de pago rechazado
     */
    sendPaymentDeclinedNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de pago rechazado...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '❌ Pago rechazado',
                        body: `Tu compra para ${data.eventName} no pudo procesarse`,
                    },
                    data: {
                        type: 'payment_declined',
                        invoice_id: data.invoiceId.toString(),
                        num_invoice: data.numInvoice,
                        route: '/orders',
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'payments',
                            sound: 'default',
                            color: '#FF0000',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default',
                            },
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de rechazo enviada');
                return {
                    success: true,
                    messageId: response,
                };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        });
    }
    /**
     * Enviar notificación de pago pendiente
     */
    sendPaymentPendingNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de pago pendiente...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '⏳ Procesando tu compra',
                        body: `Tu compra para ${data.eventName} está siendo procesada`,
                    },
                    data: {
                        type: 'payment_pending',
                        invoice_id: data.invoiceId.toString(),
                        num_invoice: data.numInvoice,
                    },
                    android: {
                        priority: 'normal',
                        notification: {
                            channelId: 'payments',
                            sound: 'default',
                            color: '#FFA500',
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de pendiente enviada');
                return {
                    success: true,
                    messageId: response,
                };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        });
    }
    /**
   * Enviar notificación de ticket recibido
   */
    sendTicketTransferReceivedNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de ticket recibido...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '🎫 Nuevo ticket recibido',
                        body: `${data.fromUserName} te envió un ticket para ${data.eventName}`,
                    },
                    data: {
                        type: 'ticket_transfer',
                        transaction_id: data.transactionId.toString(),
                        ticket_id: data.ticketId.toString(),
                        click_action: 'FLUTTER_NOTIFICATION_CLICK',
                        route: '/wallet',
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'tickets',
                            sound: 'default',
                            color: '#0031FB',
                            icon: 'ic_notification',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default',
                                badge: 1,
                            },
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de ticket recibido enviada');
                return { success: true, messageId: response };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return { success: false, error: error.message };
            }
        });
    }
    /**
     * Enviar notificación de transferencia aceptada
     */
    sendTicketTransferAcceptedNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de transferencia aceptada...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '✅ Transferencia aceptada',
                        body: `${data.recipientName} aceptó tu ticket para ${data.eventName}`,
                    },
                    data: {
                        type: 'ticket_transfer_accepted',
                        transaction_id: data.transactionId.toString(),
                        ticket_id: data.ticketId.toString(),
                        route: '/wallet',
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'tickets',
                            sound: 'default',
                            color: '#00FF00',
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de aceptación enviada');
                return { success: true, messageId: response };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return { success: false, error: error.message };
            }
        });
    }
    /**
     * Enviar notificación de transferencia rechazada
     */
    sendTicketTransferRejectedNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de transferencia rechazada...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '❌ Transferencia rechazada',
                        body: `${data.recipientName} rechazó tu ticket para ${data.eventName}`,
                    },
                    data: {
                        type: 'ticket_transfer_rejected',
                        transaction_id: data.transactionId.toString(),
                        ticket_id: data.ticketId.toString(),
                        route: '/wallet',
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'tickets',
                            sound: 'default',
                            color: '#FF0000',
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de rechazo enviada');
                return { success: true, messageId: response };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return { success: false, error: error.message };
            }
        });
    }
    /**
     * Enviar notificación de transferencia expirada
     */
    sendTicketTransferExpiredNotification(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('📱 Enviando push notification de transferencia expirada...');
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '⏰ Transferencia expirada',
                        body: `Tu ticket para ${data.eventName} ha sido devuelto a tu wallet`,
                    },
                    data: {
                        type: 'ticket_transfer_expired',
                        transaction_id: data.transactionId.toString(),
                        ticket_id: data.ticketId.toString(),
                        route: '/wallet',
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'tickets',
                            sound: 'default',
                            color: '#FFA500',
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default',
                            },
                        },
                    },
                };
                const response = yield firebase_admin_1.default.messaging().send(message);
                console.log('✅ Push notification de expiración enviada');
                return { success: true, messageId: response };
            }
            catch (error) {
                console.error('❌ Error enviando push notification:', error);
                return { success: false, error: error.message };
            }
        });
    }
}
exports.PushNotificationService = PushNotificationService;
