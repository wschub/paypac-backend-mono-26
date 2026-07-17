import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { InvoiceService } from '../services/invoice.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import { PushNotificationService } from '../services/push-notification.service';
import { verifyWompiSignature } from '../utils/wompi.utils';
import { WompiWebhookEvent } from '../types/wompi.types';
import { io } from '../index';

const invoiceService = new InvoiceService();
const transactionRepo = new TransactionRepository();
const pushService = new PushNotificationService();

/**
 * Webhook de Wompi
 * POST /api/webhooks/wompi
 *
 * Wompi envía este webhook cuando cambia el estado de una transacción
 */
export const wompiWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔔 WEBHOOK RECIBIDO DE WOMPI');
    console.log('='.repeat(80));
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📨 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(80) + '\n');

    const webhookData = req.body as WompiWebhookEvent;
    const { event, data, signature, timestamp, environment } = webhookData;

    // ============================================
    // 1️⃣ VERIFICAR FIRMA DEL WEBHOOK (SEGURIDAD)
    // ============================================
    console.log('🔐 PASO 1: Verificando firma del webhook...');
    console.log('   Environment:', environment);
    console.log('   Event:', event);
    console.log('   Timestamp:', timestamp);
    console.log('   Signature checksum:', signature.checksum);
    console.log('   Signature properties:', signature.properties);

    const isValidSignature = verifyWompiSignature(webhookData);

    if (!isValidSignature) {
      console.error('❌ FIRMA INVÁLIDA - WEBHOOK RECHAZADO');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    console.log('✅ Firma verificada correctamente\n');

    // ============================================
    // 2️⃣ VALIDAR AMBIENTE
    // ============================================
    console.log('🌍 PASO 2: Validando ambiente...');
    // Wompi identifica su propio ambiente en el payload del webhook como
    // "test" o "prod" (no "production" — eso es solo la convención de
    // nuestra variable WOMPI_MODE). Comparar contra "production" aquí hacía
    // que TODO webhook real de producción se rechazara siempre.
    const expectedEnv = process.env.WOMPI_MODE === 'sandbox' ? 'test' : 'prod';
    console.log('   WOMPI_MODE:', process.env.WOMPI_MODE);
    console.log('   Ambiente esperado:', expectedEnv);
    console.log('   Ambiente recibido:', environment);

    if (environment !== expectedEnv) {
      console.error('');
      console.error('❌ AMBIENTE INCORRECTO');
      console.error('   Esperado:', expectedEnv);
      console.error('   Recibido:', environment);
      console.error('');
      console.error('💡 DIAGNÓSTICO:');

      if (environment === 'test' && process.env.WOMPI_MODE !== 'sandbox') {
        console.error('   ❌ El frontend está enviando transacciones de PRUEBA (sandbox)');
        console.error('   📱 Solución: Usar PUB_PRO en lugar de PUB_TEST en la app');
      } else if (environment === 'prod' && process.env.WOMPI_MODE === 'sandbox') {
        console.error('   ❌ El frontend está enviando transacciones REALES');
        console.error('   📱 Solución: Cambiar WOMPI_MODE a "production" en .env');
      }
      console.error('');
      
      res.status(400).json({ 
        message: 'Invalid environment',
        expected: expectedEnv,
        received: environment,
        wompi_mode: process.env.WOMPI_MODE
      });
      return;
    }

    console.log('✅ Ambiente validado correctamente\n');

    // ============================================
    // 3️⃣ PROCESAR EVENTO
    // ============================================
    console.log('📊 PASO 3: Procesando evento...');
    console.log('   Tipo de evento:', event);

    if (event === 'transaction.updated') {
      await handleTransactionUpdated(data.transaction);
    } else {
      console.log(`ℹ️ Evento no manejado: ${event}`);
    }

    const processingTime = Date.now() - startTime;
    console.log('\n' + '='.repeat(80));
    console.log('✅ WEBHOOK PROCESADO EXITOSAMENTE');
    console.log('⏱️  Tiempo de procesamiento:', processingTime, 'ms');
    console.log('='.repeat(80) + '\n');

    // ============================================
    // 4️⃣ RESPONDER A WOMPI (SIEMPRE 200)
    // ============================================
    res.status(200).json({ 
      received: true,
      processing_time_ms: processingTime 
    });
  } catch (error: any) {
    console.error('\n' + '❌'.repeat(40));
    console.error('❌ ERROR CRÍTICO EN WEBHOOK');
    console.error('❌'.repeat(40));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌'.repeat(40) + '\n');

    // Aún respondemos 200 para que Wompi no reintente
    res.status(200).json({ 
      received: true, 
      error: error.message 
    });
  }
};

/**
 * Manejar actualización de transacción
 */
async function handleTransactionUpdated(transaction: any) {
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
    console.error('   ⚠️ Posibles causas:');
    console.error('   - El num_invoice no existe en la BD');
    console.error('   - Hay un error en el reference enviado');
    console.error('   - La transacción fue creada manualmente\n');
    return;
  }

  console.log('✅ Invoice encontrada:');
  console.log('   ID:', invoice.id);
  console.log('   num_invoice:', invoice.num_invoice);
  console.log('   User ID:', invoice.user_id);
  console.log('   Event ID:', invoice.event_id);
  console.log('   Status actual:', invoice.status);
  console.log('   Total:', invoice.total, 'COP\n');

  // Registrar en la factura el método de pago REAL confirmado por Wompi
  // (fuente de verdad para reportes; puede diferir del declarado al crearla)
  if (payment_method_type && invoice.payment_method !== payment_method_type) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { payment_method: payment_method_type },
    });
    console.log(`✅ Invoice.payment_method actualizado a ${payment_method_type}\n`);
  }

  // ============================================
  // 2️⃣ BUSCAR O CREAR TRANSACTION
  // ============================================
  console.log('🔍 PASO 2: Buscando Transaction existente...');
  let transactionRecord = await transactionRepo.findByReference(reference);

  if (transactionRecord) {
    console.log('✅ Transaction encontrada - Actualizando...');
    console.log('   Transaction ID:', transactionRecord.id);
    console.log('   Status anterior:', transactionRecord.status);
    console.log('   Status nuevo:', status);

    // Evitar duplicados
    if (transactionRecord.status === 'APPROVED' && status === 'APPROVED') {
      console.log('⚠️ WEBHOOK DUPLICADO DETECTADO - Ignorando...');
      console.log('   Esta transacción ya fue procesada anteriormente\n');
      return;
    }

    transactionRecord = await transactionRepo.update(transactionRecord.id, {
      status: status,
      status_message: getStatusMessage(status),
      finalized_at: finalized_at ? new Date(finalized_at) : new Date(),
      payment_method: payment_method || {},
      customer_data: JSON.stringify(customer_data || {}),
      meta: {
        ...((transactionRecord.meta as any) || {}),
        wompi_transaction_id,
        wompi_status: status,
        webhook_received_at: new Date().toISOString(),
      },
    });

    console.log('✅ Transaction actualizada exitosamente\n');
  } else {
    console.log('⚠️ Transaction no encontrada - Creando nueva...');

    const customerPhone = customer_data?.phone_number || 
                         customer_data?.legal_id || 
                         'UNKNOWN';

    transactionRecord = await transactionRepo.create({
      user_id: invoice.user_id,
      user_uid: invoice.user_uid,
      invoice_id: reference,
      created_at: created_at ? new Date(created_at) : new Date(),
      finalized_at: finalized_at ? new Date(finalized_at) : new Date(),
      amount_in_cents: amount_in_cents,
      reference: reference,
      customer_email: customer_email,
      currency: 'COP',
      payment_method_type: payment_method_type,
      payment_method: payment_method || {},
      status: status,
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

    console.log('✅ Transaction creada exitosamente');
    console.log('   Nuevo Transaction ID:', transactionRecord.id, '\n');
  }

  // ============================================
  // 3️⃣ NOTIFICAR VÍA SOCKET.IO - TRANSACTION UPDATED
  // ============================================
  console.log('🔔 PASO 3: Emitiendo notificación Socket.IO (transaction:updated)...');
  console.log('   Room:', `user:${invoice.user_id}`);
  console.log('   Event:', 'transaction:updated');
  console.log('   Status:', status);
  
  io.to(`user:${invoice.user_id}`).emit('transaction:updated', {
    transaction_id: transactionRecord.id,
    invoice_id: invoice.id,
    num_invoice: invoice.num_invoice,
    status: status,
    status_message: getStatusMessage(status),
    amount: amount_in_cents / 100,
    timestamp: new Date().toISOString(),
  });
  
  console.log('✅ Notificación Socket.IO enviada\n');

  // ============================================
  // 4️⃣ PROCESAR SEGÚN EL STATUS
  // ============================================
  console.log('🎯 PASO 4: Procesando según status...');
  console.log('   Status recibido:', status);
  console.log('');

  // ============================================
  // 🟢 STATUS: APPROVED
  // ============================================
  if (status === 'APPROVED') {
    console.log('🟢'.repeat(40));
    console.log('🟢 STATUS: APPROVED - PAGO EXITOSO');
    console.log('🟢'.repeat(40));
    console.log('📌 Acciones a ejecutar:');
    console.log('   1. Crear tickets reales');
    console.log('   2. Actualizar Invoice a PAID');
    console.log('   3. Socket.IO: tickets:created');
    console.log('   4. Email: Tickets con QR');
    console.log('   5. Push: "¡Tus tickets están listos!"');
    console.log('🟢'.repeat(40) + '\n');

    const meta = (transactionRecord.meta as any) || {};
    const customer_ID_phone = meta.customer_ID_phone || 
                             customer_data?.phone_number || 
                             customer_data?.legal_id || 
                             'UNKNOWN';

    console.log('📱 Customer ID Phone:', customer_ID_phone);

    try {
      console.log('🎫 Llamando a invoiceService.updateInvoiceStatus()...\n');

      // 🎫 CREAR TICKETS
      await invoiceService.updateInvoiceStatus(
        invoice.id,
        transactionRecord.id,
        'PAID',
        customer_ID_phone
      );

      console.log('\n' + '✅'.repeat(40));
      console.log('✅ TICKETS CREADOS EXITOSAMENTE');
      console.log('✅'.repeat(40));
      console.log('   Invoice:', invoice.num_invoice);
      console.log('   User ID:', invoice.user_id);
      console.log('   Transaction ID:', transactionRecord.id);
      console.log('   Total tickets:', invoice.num_items);
      console.log('✅'.repeat(40) + '\n');

      // Socket.IO: tickets:created
      console.log('🔔 Emitiendo Socket.IO: tickets:created');
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

      // Email con Brevo (TODO)
      console.log('📧 Email con Brevo:');
      console.log('   ⏳ Pendiente de implementación');
      console.log('   Email:', customer_email);
      console.log('   Tickets:', invoice.num_items);
      console.log('');

      // Push notification
      console.log('📱 Push notification (FCM):');
      const user = await prisma.user.findUnique({
        where: { id: invoice.user_id },
        select: { fcm_token: true },
      });

      if (user?.fcm_token) {
        console.log('   ✅ Usuario tiene FCM token');
        const event = await prisma.event.findUnique({
          where: { id: invoice.event_id },
          select: { name: true },
        });

        const pushResult = await pushService.sendTicketsCreatedNotification(
          user.fcm_token,
          invoice.user_id,
          {
            invoiceId: invoice.id,
            numInvoice: invoice.num_invoice,
            eventName: event?.name || 'tu evento',
            ticketCount: invoice.num_items,
            eventId: invoice.event_id,
          }
        );

        if (pushResult.success) {
          console.log('   ✅ Push notification enviada');
        } else {
          console.log('   ❌ Error:', pushResult.error);
        }
      } else {
        console.log('   ⚠️ Usuario no tiene FCM token');
      }
      console.log('');

    } catch (error: any) {
      console.error('\n' + '❌'.repeat(40));
      console.error('❌ ERROR AL CREAR TICKETS');
      console.error('❌'.repeat(40));
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('❌'.repeat(40) + '\n');

      await transactionRepo.update(transactionRecord.id, {
        status_message: `Error al crear tickets: ${error.message}`,
        meta: {
          ...meta,
          ticket_creation_error: error.message,
          ticket_creation_error_date: new Date().toISOString(),
        },
      });

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
    console.log('🔴'.repeat(40));
    console.log('🔴 STATUS: DECLINED - PAGO RECHAZADO');
    console.log('🔴'.repeat(40));
    console.log('📌 Acciones a ejecutar:');
    console.log('   1. Actualizar Invoice a REJECTED');
    console.log('   2. Socket.IO: payment:declined');
    console.log('   3. Email: Pago rechazado + razón');
    console.log('   4. Push: "Tu pago fue rechazado"');
    console.log('🔴'.repeat(40) + '\n');

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'REJECTED' },
    });
    console.log('✅ Invoice actualizada a REJECTED');

    io.to(`user:${invoice.user_id}`).emit('payment:declined', {
      invoice_id: invoice.id,
      num_invoice: invoice.num_invoice,
      status: status,
      message: getStatusMessage(status),
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Socket.IO: payment:declined emitido\n');
  }
  // ============================================
  // ⚪ STATUS: VOIDED
  // ============================================
  else if (status === 'VOIDED') {
    console.log('⚪'.repeat(40));
    console.log('⚪ STATUS: VOIDED - PAGO ANULADO');
    console.log('⚪'.repeat(40));
    console.log('📌 Acciones a ejecutar:');
    console.log('   1. Actualizar Invoice a CANCELED');
    console.log('   2. Socket.IO: payment:voided');
    console.log('   3. Email: Reembolso procesado');
    console.log('   4. Push: "Tu pago fue anulado"');
    console.log('⚪'.repeat(40) + '\n');

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'CANCELED' },
    });
    console.log('✅ Invoice actualizada a CANCELED');

    io.to(`user:${invoice.user_id}`).emit('payment:voided', {
      invoice_id: invoice.id,
      num_invoice: invoice.num_invoice,
      message: 'El pago ha sido anulado',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Socket.IO: payment:voided emitido\n');
  }
  // ============================================
  // 🟡 STATUS: PENDING
  // ============================================
  else if (status === 'PENDING') {
    console.log('🟡'.repeat(40));
    console.log('🟡 STATUS: PENDING - PAGO EN PROCESO');
    console.log('🟡'.repeat(40));
    console.log('📌 Acciones a ejecutar:');
    console.log('   1. Mantener Invoice en ISSUED');
    console.log('   2. Socket.IO: payment:pending');
    console.log('   3. Email: NO enviar');
    console.log('   4. Push: NO enviar');
    console.log('   5. Esperar siguiente webhook');
    console.log('🟡'.repeat(40) + '\n');

    io.to(`user:${invoice.user_id}`).emit('payment:pending', {
      invoice_id: invoice.id,
      num_invoice: invoice.num_invoice,
      message: 'El pago está siendo procesado',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Socket.IO: payment:pending emitido\n');
  }
  // ============================================
  // ⚫ STATUS: ERROR
  // ============================================
  else if (status === 'ERROR') {
    console.log('⚫'.repeat(40));
    console.log('⚫ STATUS: ERROR - ERROR EN PAGO');
    console.log('⚫'.repeat(40));
    console.log('📌 Acciones a ejecutar:');
    console.log('   1. Actualizar Invoice a REJECTED');
    console.log('   2. Socket.IO: payment:declined');
    console.log('   3. Email: Error técnico + soporte');
    console.log('   4. Push: "Hubo un error"');
    console.log('⚫'.repeat(40) + '\n');

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'REJECTED' },
    });
    console.log('✅ Invoice actualizada a REJECTED');

    io.to(`user:${invoice.user_id}`).emit('payment:declined', {
      invoice_id: invoice.id,
      num_invoice: invoice.num_invoice,
      status: status,
      message: getStatusMessage(status),
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Socket.IO: payment:declined emitido\n');
  }
  // ============================================
  // ❓ STATUS: DESCONOCIDO
  // ============================================
  else {
    console.log('❓'.repeat(40));
    console.log('❓ STATUS DESCONOCIDO:', status);
    console.log('❓'.repeat(40));
    console.log('⚠️ Este status no está manejado');
    console.log('   Por favor, revisar documentación de Wompi');
    console.log('❓'.repeat(40) + '\n');
  }
}

/**
 * Obtener mensaje de status en español
 */
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    APPROVED: 'Transacción aprobada exitosamente',
    PENDING: 'Transacción pendiente de confirmación',
    DECLINED: 'Transacción rechazada por el banco',
    VOIDED: 'Transacción anulada',
    ERROR: 'Error al procesar la transacción',
  };

  return messages[status] || `Estado desconocido: ${status}`;
}