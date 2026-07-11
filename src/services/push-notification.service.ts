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

  /**
 * Enviar notificación de ticket recibido
 */
async sendTicketTransferReceivedNotification(
  fcmToken: string,
  data: {
    fromUserName: string;
    eventName: string;
    transactionId: number;
    ticketId: number;
  }
) {
  try {
    console.log('📱 Enviando push notification de ticket recibido...');

    const message: admin.messaging.Message = {
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

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification de ticket recibido enviada');

    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error enviando push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificación de transferencia aceptada
 */
async sendTicketTransferAcceptedNotification(
  fcmToken: string,
  data: {
    recipientName: string;
    eventName: string;
    transactionId: number;
    ticketId: number;
  }
) {
  try {
    console.log('📱 Enviando push notification de transferencia aceptada...');

    const message: admin.messaging.Message = {
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

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification de aceptación enviada');

    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error enviando push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reventa — notificar al VENDEDOR que su ticket fue pagado y vendido
 */
async sendResaleSoldToSeller(
  fcmToken: string,
  data: { eventName: string; soldPrice: number; listingId: number }
) {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '💰 ¡Tu ticket fue vendido!',
        body: `Tu ticket de ${data.eventName} fue pagado por $${data.soldPrice.toLocaleString('es-CO')}. Pronto recibirás tu dispersión.`,
      },
      data: {
        type: 'resale_sold_seller',
        listing_id: data.listingId.toString(),
        route: '/wallet',
      },
      android: {
        priority: 'high',
        notification: { channelId: 'tickets', sound: 'default', color: '#12B76A' },
      },
    };
    const response = await admin.messaging().send(message);
    console.log('✅ Push reventa (vendedor) enviada');
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error push reventa vendedor:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reventa — notificar al COMPRADOR que ya tiene su ticket
 */
async sendResaleTicketToBuyer(
  fcmToken: string,
  data: { eventName: string; ticketId: number }
) {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '🎟️ ¡Ya tienes tu ticket!',
        body: `Tu compra fue confirmada. El ticket de ${data.eventName} ya está en tu wallet.`,
      },
      data: {
        type: 'resale_ticket_buyer',
        ticket_id: data.ticketId.toString(),
        route: '/wallet',
      },
      android: {
        priority: 'high',
        notification: { channelId: 'tickets', sound: 'default', color: '#0031FB' },
      },
    };
    const response = await admin.messaging().send(message);
    console.log('✅ Push reventa (comprador) enviada');
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error push reventa comprador:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reventa — notificar al ganador de la subasta que debe pagar
 */
async sendResaleOfferAcceptedNotification(
  fcmToken: string,
  data: { eventName: string; amount: number; listingId: number; windowMinutes: number }
) {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '🏆 ¡Tu oferta fue aceptada!',
        body: `Tienes ${data.windowMinutes} min para pagar $${data.amount.toLocaleString('es-CO')} por el ticket de ${data.eventName}.`,
      },
      data: {
        type: 'resale_offer_accepted',
        listing_id: data.listingId.toString(),
        route: '/wallet',
      },
      android: {
        priority: 'high',
        notification: { channelId: 'tickets', sound: 'default', color: '#F79009' },
      },
    };
    const response = await admin.messaging().send(message);
    console.log('✅ Push oferta aceptada enviada');
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error push oferta aceptada:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reventa — notificar al VENDEDOR que llegó una nueva oferta
 */
async sendResaleNewOfferToSeller(
  fcmToken: string,
  data: { eventName: string; amount: number; listingId: number }
) {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '🔨 Nueva oferta por tu ticket',
        body: `Te ofrecen $${data.amount.toLocaleString('es-CO')} por tu ticket de ${data.eventName}.`,
      },
      data: {
        type: 'resale_new_offer',
        listing_id: data.listingId.toString(),
        route: '/wallet',
      },
      android: {
        priority: 'high',
        notification: { channelId: 'tickets', sound: 'default', color: '#0031FB' },
      },
    };
    const response = await admin.messaging().send(message);
    console.log('✅ Push nueva oferta (vendedor) enviada');
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error push nueva oferta vendedor:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Reventa — notificar a los demás postores que el ticket ya se vendió a otro comprador
 */
async sendResaleOfferRejectedNotification(
  fcmToken: string,
  data: { eventName: string; listingId: number }
) {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '🎟️ Subasta finalizada',
        body: `El ticket de ${data.eventName} ya fue vendido a otro comprador. ¡Sigue explorando reventas verificadas!`,
      },
      data: {
        type: 'resale_offer_rejected',
        listing_id: data.listingId.toString(),
        route: '/wallet',
      },
      android: {
        priority: 'high',
        notification: { channelId: 'tickets', sound: 'default', color: '#667085' },
      },
    };
    const response = await admin.messaging().send(message);
    console.log('✅ Push oferta rechazada enviada');
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error push oferta rechazada:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificación de transferencia rechazada
 */
async sendTicketTransferRejectedNotification(
  fcmToken: string,
  data: {
    recipientName: string;
    eventName: string;
    transactionId: number;
    ticketId: number;
  }
) {
  try {
    console.log('📱 Enviando push notification de transferencia rechazada...');

    const message: admin.messaging.Message = {
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

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification de rechazo enviada');

    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error enviando push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificación de transferencia expirada
 */
async sendTicketTransferExpiredNotification(
  fcmToken: string,
  data: {
    eventName: string;
    transactionId: number;
    ticketId: number;
  }
) {
  try {
    console.log('📱 Enviando push notification de transferencia expirada...');

    const message: admin.messaging.Message = {
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

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification de expiración enviada');

    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Error enviando push notification:', error);
    return { success: false, error: error.message };
  }
}


}