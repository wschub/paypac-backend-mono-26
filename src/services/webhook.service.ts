import { prisma } from '../config/db';
import { InvoiceService } from '../services/invoice.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import { PushNotificationService } from '../services/push-notification.service';
import { NotificationMessageQueueService } from '../services/notificationmessagequeue.service';
import { io } from '../index';

const invoiceService  = new InvoiceService();
const transactionRepo = new TransactionRepository();
const pushService     = new PushNotificationService();
const emailService    = new NotificationMessageQueueService(); // ← agregar

export class WebhookService {
  async handleTransactionUpdated(transaction: any): Promise<void> {
    console.log('📨 PROCESANDO TRANSACTION.UPDATED');
    console.log('-'.repeat(80));

    const {
      id: wompi_transaction_id,
      reference,
      status,
      amount_in_cents,
      customer_email,
      payment_method_type,
      payment_method,
      customer_data,
      finalized_at,
      created_at,
    } = transaction;

    console.log('📋 Datos de la transacción:');
    console.log('   Wompi Transaction ID:', wompi_transaction_id);
    console.log('   Reference (num_invoice):', reference);
    console.log('   Status:', status);
    console.log('   Amount:', amount_in_cents / 100, 'COP');
    console.log('   Email:', customer_email);
    console.log('   Payment Method:', payment_method_type);
    console.log('   Customer Data:', JSON.stringify(customer_data, null, 2));
    console.log('-'.repeat(80) + '\n');

    // ============================================
    // 1️⃣ BUSCAR INVOICE POR REFERENCE
    // ============================================
    console.log('🔍 PASO 1: Buscando Invoice...');
    console.log('   Buscando num_invoice =', reference);

    const invoice = await prisma.invoice.findFirst({
      where: { num_invoice: reference },
    });

    if (!invoice) {
      console.error(`❌ Invoice no encontrada para reference: ${reference}`);
      return;
    }

    console.log('✅ Invoice encontrada:', invoice.id, '\n');

    // ============================================
    // 2️⃣ BUSCAR O CREAR TRANSACTION
    // ============================================
    console.log('🔍 PASO 2: Buscando Transaction existente...');
    let transactionRecord = await transactionRepo.findByReference(reference);

    if (transactionRecord) {
      console.log('✅ Transaction encontrada - Actualizando...');

      if (transactionRecord.status === 'APPROVED' && status === 'APPROVED') {
        console.log('⚠️ WEBHOOK DUPLICADO DETECTADO - Ignorando...');
        return;
      }

      transactionRecord = await transactionRepo.updateStatus(
        transactionRecord.id,
        status,
        getStatusMessage(status),
        finalized_at ? new Date(finalized_at) : new Date(),
        {
          payment_method: payment_method || {},
          customer_data: JSON.stringify(customer_data || {}),
          meta: {
            ...((transactionRecord.meta as any) || {}),
            wompi_transaction_id,
            wompi_status: status,
            webhook_received_at: new Date().toISOString(),
          },
        }
      );

      console.log('✅ Transaction actualizada exitosamente\n');
    } else {
      console.log('⚠️ Transaction no encontrada - Creando nueva...');

      const customerPhone =
        customer_data?.phone_number ||
        customer_data?.legal_id ||
        'UNKNOWN';

      transactionRecord = await transactionRepo.create({
        user_id: invoice.user_id,
        user_uid: invoice.user_uid,
        invoice_id: reference,
        created_at: created_at ? new Date(created_at) : new Date(),
        finalized_at: finalized_at ? new Date(finalized_at) : new Date(),
        amount_in_cents,
        reference,
        customer_email,
        currency: 'COP',
        payment_method_type,
        payment_method: payment_method || {},
        status,
        status_message: getStatusMessage(status),
        billing_data: JSON.stringify(customer_data || {}),
        shipping_address: '',
        redirect_url: '',
        payment_source_id: '',
        payment_link_id: '',
        customer_data: JSON.stringify(customer_data || {}),
        bill_id: '',
        taxes: [],
        tip_in_cents: '0',
        meta: {
          wompi_transaction_id,
          wompi_status: status,
          customer_ID_phone: customerPhone,
          payment_brand: payment_method?.extra?.brand || 'N/A',
          payment_last_four: payment_method?.extra?.last_four || 'N/A',
          installments: payment_method?.installments || 1,
          webhook_received_at: new Date().toISOString(),
        },
      });

      console.log('✅ Transaction creada exitosamente:', transactionRecord.id, '\n');
    }

    // ============================================
    // 3️⃣ NOTIFICAR VÍA SOCKET.IO - TRANSACTION UPDATED
    // ============================================
    console.log('🔔 PASO 3: Emitiendo notificación Socket.IO (transaction:updated)...');
    io.to(`user:${invoice.user_id}`).emit('transaction:updated', {
      transaction_id: transactionRecord.id,
      invoice_id: invoice.id,
      num_invoice: invoice.num_invoice,
      status,
      status_message: getStatusMessage(status),
      amount: amount_in_cents / 100,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Notificación Socket.IO enviada\n');

    // ============================================
    // 4️⃣ PROCESAR SEGÚN EL STATUS
    // ============================================
    console.log('🎯 PASO 4: Procesando según status...');
    console.log('   Status recibido:', status, '\n');

    // ============================================
    // 🟢 STATUS: APPROVED
    // ============================================
    if (status === 'APPROVED') {
      console.log('🟢'.repeat(40));
      console.log('🟢 STATUS: APPROVED - PAGO EXITOSO');
      console.log('🟢'.repeat(40) + '\n');

      const meta = (transactionRecord.meta as any) || {};
      const customer_ID_phone =
        meta.customer_ID_phone ||
        customer_data?.phone_number ||
        customer_data?.legal_id ||
        'UNKNOWN';

      try {
        await invoiceService.updateInvoiceStatus(
          invoice.id,
          transactionRecord.id,
          'PAID',
          customer_ID_phone
        );

        console.log('✅ TICKETS CREADOS EXITOSAMENTE\n');

        // 📊 Registrar balance de promotor si hubo código
try {
  const invoiceWithCode = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    select: {
      promoter_code_id:           true,
      promoter_commission_amount: true,
      num_items:                  true,
      promoterCode: {
        select: { promoter_id: true },
      },
    },
  });

  if (invoiceWithCode?.promoter_code_id && invoiceWithCode.promoter_commission_amount) {
    const rewardRule = await prisma.eventRewardRules.findFirst({
      where: { event_id: invoice.event_id },
    });

    await prisma.eventBalancePromoters.create({
      data: {
        event_id:           invoice.event_id,
        promoter_id:        invoiceWithCode.promoterCode!.promoter_id,
        reward_rule_id:     rewardRule?.id ?? null,
        reward_amount:      invoiceWithCode.promoter_commission_amount,
        reward_description: `Comisión por ${invoiceWithCode.num_items} ticket(s) — Invoice ${reference}`,
        invoice_id:         invoice.id,
        tickets_sold:       invoiceWithCode.num_items,
        status:             0,
      },
    });

    await prisma.promoterCode.update({
      where: { id: invoiceWithCode.promoter_code_id },
      data: { uses_count: { increment: 1 } },
    });

    console.log('✅ Balance de promotor registrado');
  }
} catch (promoError: any) {
  console.error('⚠️ Error registrando balance de promotor:', promoError.message);
}

        // Socket.IO: tickets:created
        io.to(`user:${invoice.user_id}`).emit('tickets:created', {
          invoice_id: invoice.id,
          num_invoice: invoice.num_invoice,
          transaction_id: transactionRecord.id,
          event_id: invoice.event_id,
          ticket_count: invoice.num_items,
          message: '¡Tus tickets han sido generados exitosamente!',
          timestamp: new Date().toISOString(),
        });
        console.log('✅ Socket.IO: tickets:created emitido\n');

        // Traer usuario para nombre + FCM
        const user = await prisma.user.findUnique({
          where: { id: invoice.user_id },
          select: { name: true, last_name: true, fcm_token: true },
        });

        const userName = user ? `${user.name} ${user.last_name}` : 'Usuario';

        // Traer evento para nombre
        const event = await prisma.event.findUnique({
          where: { id: invoice.event_id },
          select: { name: true },
        });

        // 📧 Email INVOICE_STATUS (pago aprobado)
        try {
          await emailService.queueEmail({
            userId: invoice.user_id,
            email: customer_email,
            templateCode: 'INVOICE_STATUS',
            variables: {
              user_name: userName,
              num_invoice: invoice.num_invoice,
              status,
              status_message: getStatusMessage(status),
              amount: (amount_in_cents / 100).toLocaleString('es-CO'),
              payment_method_type,
            },
          });
          console.log('📧 Email INVOICE_STATUS encolado');
        } catch (e: any) {
          console.error('⚠️ No se pudo encolar INVOICE_STATUS:', e.message);
        }

        // 📧 Email TICKET_PURCHASE (detalle de tickets)
        try {
          await emailService.queueEmail({
            userId: invoice.user_id,
            email: customer_email,
            templateCode: 'TICKET_PURCHASE',
            variables: {
              user_name: userName,
              event_name: event?.name || 'tu evento',
              tickets_qty: invoice.num_items,
              total_amount: (amount_in_cents / 100).toLocaleString('es-CO'),
            },
          });
          console.log('📧 Email TICKET_PURCHASE encolado');
        } catch (e: any) {
          console.error('⚠️ No se pudo encolar TICKET_PURCHASE:', e.message);
        }

        // Push notification
        if (user?.fcm_token) {
          const pushResult = await pushService.sendTicketsCreatedNotification(
            user.fcm_token,
            {
              invoiceId: invoice.id,
              numInvoice: invoice.num_invoice,
              eventName: event?.name || 'tu evento',
              ticketCount: invoice.num_items,
              eventId: invoice.event_id,
            }
          );
          console.log(pushResult.success ? '✅ Push enviada' : `❌ Push error: ${pushResult.error}`);
        } else {
          console.log('⚠️ Usuario no tiene FCM token');
        }

      } catch (error: any) {
        console.error('❌ ERROR AL CREAR TICKETS:', error.message);

        const meta = (transactionRecord.meta as any) || {};
        await transactionRepo.updateStatus(
          transactionRecord.id,
          transactionRecord.status,
          `Error al crear tickets: ${error.message}`,
          undefined,
          {
            meta: {
              ...meta,
              ticket_creation_error: error.message,
              ticket_creation_error_date: new Date().toISOString(),
            },
          }
        );

        io.to(`user:${invoice.user_id}`).emit('tickets:error', {
          invoice_id: invoice.id,
          num_invoice: invoice.num_invoice,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ============================================
    // 🔴 STATUS: DECLINED
    // ============================================
    else if (status === 'DECLINED') {
      console.log('🔴 STATUS: DECLINED - PAGO RECHAZADO\n');

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'REJECTED' },
      });

      io.to(`user:${invoice.user_id}`).emit('payment:declined', {
        invoice_id: invoice.id,
        num_invoice: invoice.num_invoice,
        status,
        message: getStatusMessage(status),
        timestamp: new Date().toISOString(),
      });

      try {
        const user = await prisma.user.findUnique({
          where: { id: invoice.user_id },
          select: { name: true, last_name: true },
        });
        await emailService.queueEmail({
          userId: invoice.user_id,
          email: customer_email,
          templateCode: 'INVOICE_STATUS',
          variables: {
            user_name: user ? `${user.name} ${user.last_name}` : 'Usuario',
            num_invoice: invoice.num_invoice,
            status,
            status_message: getStatusMessage(status),
            amount: (amount_in_cents / 100).toLocaleString('es-CO'),
            payment_method_type,
          },
        });
        console.log('📧 Email INVOICE_STATUS (DECLINED) encolado');
      } catch (e: any) {
        console.error('⚠️ No se pudo encolar INVOICE_STATUS:', e.message);
      }
    }

    // ============================================
    // ⚪ STATUS: VOIDED
    // ============================================
    else if (status === 'VOIDED') {
      console.log('⚪ STATUS: VOIDED - PAGO ANULADO\n');

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'CANCELED' },
      });

      io.to(`user:${invoice.user_id}`).emit('payment:voided', {
        invoice_id: invoice.id,
        num_invoice: invoice.num_invoice,
        message: 'El pago ha sido anulado',
        timestamp: new Date().toISOString(),
      });

      try {
        const user = await prisma.user.findUnique({
          where: { id: invoice.user_id },
          select: { name: true, last_name: true },
        });
        await emailService.queueEmail({
          userId: invoice.user_id,
          email: customer_email,
          templateCode: 'INVOICE_STATUS',
          variables: {
            user_name: user ? `${user.name} ${user.last_name}` : 'Usuario',
            num_invoice: invoice.num_invoice,
            status,
            status_message: getStatusMessage(status),
            amount: (amount_in_cents / 100).toLocaleString('es-CO'),
            payment_method_type,
          },
        });
        console.log('📧 Email INVOICE_STATUS (VOIDED) encolado');
      } catch (e: any) {
        console.error('⚠️ No se pudo encolar INVOICE_STATUS:', e.message);
      }
    }

    // ============================================
    // 🟡 STATUS: PENDING — sin email
    // ============================================
    else if (status === 'PENDING') {
      console.log('🟡 STATUS: PENDING - esperando siguiente webhook\n');

      io.to(`user:${invoice.user_id}`).emit('payment:pending', {
        invoice_id: invoice.id,
        num_invoice: invoice.num_invoice,
        message: 'El pago está siendo procesado',
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // ⚫ STATUS: ERROR
    // ============================================
    else if (status === 'ERROR') {
      console.log('⚫ STATUS: ERROR - ERROR EN PAGO\n');

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'REJECTED' },
      });

      io.to(`user:${invoice.user_id}`).emit('payment:declined', {
        invoice_id: invoice.id,
        num_invoice: invoice.num_invoice,
        status,
        message: getStatusMessage(status),
        timestamp: new Date().toISOString(),
      });

      try {
        const user = await prisma.user.findUnique({
          where: { id: invoice.user_id },
          select: { name: true, last_name: true },
        });
        await emailService.queueEmail({
          userId: invoice.user_id,
          email: customer_email,
          templateCode: 'INVOICE_STATUS',
          variables: {
            user_name: user ? `${user.name} ${user.last_name}` : 'Usuario',
            num_invoice: invoice.num_invoice,
            status,
            status_message: getStatusMessage(status),
            amount: (amount_in_cents / 100).toLocaleString('es-CO'),
            payment_method_type,
          },
        });
        console.log('📧 Email INVOICE_STATUS (ERROR) encolado');
      } catch (e: any) {
        console.error('⚠️ No se pudo encolar INVOICE_STATUS:', e.message);
      }
    }

    else {
      console.log('❓ STATUS DESCONOCIDO:', status, '\n');
    }
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    APPROVED: 'Transacción aprobada exitosamente',
    PENDING:  'Transacción pendiente de confirmación',
    DECLINED: 'Transacción rechazada por el banco',
    VOIDED:   'Transacción anulada',
    ERROR:    'Error al procesar la transacción',
  };
  return messages[status] || `Estado desconocido: ${status}`;
}