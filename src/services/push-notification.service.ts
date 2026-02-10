import admin from 'firebase-admin';

/**
 * Servicio para enviar notificaciones push con Firebase Cloud Messaging
 */
export class PushNotificationService {
  /**
   * Enviar notificación de tickets creados
   */
  async sendTicketsCreatedNotification(
    fcmToken: string,
    data: {
      invoiceId: number;
      numInvoice: string;
      eventName: string;
      ticketCount: number;
      eventId: number;
    }
  ) {
    try {
      console.log('📱 Enviando push notification de tickets creados...');
      console.log('   FCM Token:', fcmToken.substring(0, 20) + '...');
      console.log('   Invoice:', data.numInvoice);
      console.log('   Tickets:', data.ticketCount);

      const message: admin.messaging.Message = {
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

      const response = await admin.messaging().send(message);
      
      console.log('✅ Push notification enviada exitosamente');
      console.log('   Response:', response);

      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
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
  }

  /**
   * Enviar notificación de pago rechazado
   */
  async sendPaymentDeclinedNotification(
    fcmToken: string,
    data: {
      invoiceId: number;
      numInvoice: string;
      eventName: string;
      reason?: string;
    }
  ) {
    try {
      console.log('📱 Enviando push notification de pago rechazado...');

      const message: admin.messaging.Message = {
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

      const response = await admin.messaging().send(message);
      
      console.log('✅ Push notification de rechazo enviada');

      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
      console.error('❌ Error enviando push notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar notificación de pago pendiente
   */
  async sendPaymentPendingNotification(
    fcmToken: string,
    data: {
      invoiceId: number;
      numInvoice: string;
      eventName: string;
    }
  ) {
    try {
      console.log('📱 Enviando push notification de pago pendiente...');

      const message: admin.messaging.Message = {
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

      const response = await admin.messaging().send(message);
      
      console.log('✅ Push notification de pendiente enviada');

      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
      console.error('❌ Error enviando push notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}