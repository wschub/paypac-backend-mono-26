import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { InvoiceService } from '../services/invoice.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import { verifyWompiSignature } from '../utils/wompi.utils';
import { WompiWebhookEvent } from '../types/wompi.types';

const invoiceService = new InvoiceService();
const transactionRepo = new TransactionRepository();

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
  try {
    console.log('🔔 Webhook recibido de Wompi:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body as WompiWebhookEvent;
    const { event, data, signature, timestamp, environment } = webhookData;

    // 1. Verificar firma del webhook (seguridad)
    const isValidSignature = verifyWompiSignature(webhookData);

    if (!isValidSignature) {
      console.error('❌ Firma del webhook inválida');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    console.log('✅ Firma del webhook verificada');

    // 2. Validar ambiente
    const expectedEnv = process.env.WOMPI_MODE === 'sandbox' ? 'test' : 'prod';
    if (environment !== expectedEnv) {
      console.error(`❌ Ambiente incorrecto. Esperado: ${expectedEnv}, Recibido: ${environment}`);
      res.status(400).json({ message: 'Invalid environment' });
      return;
    }

    // 3. Procesar según el tipo de evento
    if (event === 'transaction.updated') {
      await handleTransactionUpdated(data.transaction);
    } else {
      console.log(`ℹ️ Evento no manejado: ${event}`);
    }

    // 4. Responder a Wompi que recibimos el webhook (status 200)
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Manejar actualización de transacción
 */
async function handleTransactionUpdated(transaction: any) {
  console.log('📨 Procesando transacción:', transaction);

  const {
    id: wompi_transaction_id,
    reference, // Este es el invoice.num_invoice
    status,
    amount_in_cents,
    customer_email,
    payment_method_type,
    payment_method,
    customer_data,
    finalized_at,
  } = transaction;

  // 1. Buscar Invoice por reference
  const invoice = await prisma.invoice.findFirst({
    where: { num_invoice: reference },
  });

  if (!invoice) {
    console.error(`❌ Invoice no encontrada para reference: ${reference}`);
    return;
  }

  console.log(`✅ Invoice encontrada: ${invoice.id} - ${invoice.num_invoice}`);

  // 2. Buscar Transaction existente
  let transactionRecord = await transactionRepo.findByReference(reference);

  // 3. Actualizar o crear Transaction
  if (transactionRecord) {
    console.log(`✅ Transaction encontrada: ${transactionRecord.id}`);

    // Actualizar existente
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
      },
    });
  } else {
    console.log('⚠️ Transaction no encontrada, creando nueva...');

    // Crear nueva (backup por si no se creó antes)
    transactionRecord = await transactionRepo.create({
      user_id: invoice.user_id,
      user_uid: invoice.user_uid,
      invoice_id: reference,
      created_at: new Date(),
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
      },
    });
  }

  // 4. Si el pago fue APROBADO, crear los Tickets
  if (status === 'APPROVED') {
    console.log('✅ Pago APROBADO. Creando tickets...');

    // Obtener customer_ID_phone del meta
    const meta = (transactionRecord.meta as any) || {};
    const customer_ID_phone = meta.customer_ID_phone || 'UNKNOWN';

    try {
      // 🎫 Llamar a updateInvoiceStatus que creará los Tickets
      await invoiceService.updateInvoiceStatus(
        invoice.id,
        transactionRecord.id,
        'PAID',
        customer_ID_phone
      );

      console.log(`✅ Tickets creados exitosamente para Invoice ${invoice.num_invoice}`);

      // TODO: Enviar notificación al usuario vía Socket.IO
      // TODO: Enviar email con tickets
    } catch (error: any) {
      console.error('❌ Error al crear tickets:', error.message);

      // Marcar la transacción con error
      await transactionRepo.update(transactionRecord.id, {
        status_message: `Error al crear tickets: ${error.message}`,
        meta: {
          ...((transactionRecord.meta as any) || {}),
          ticket_creation_error: error.message,
        },
      });
    }
  } else if (status === 'DECLINED' || status === 'ERROR') {
    console.log(`❌ Pago ${status}`);

    // Actualizar Invoice a REJECTED
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'REJECTED' },
    });

    // TODO: Notificar al usuario del error
  } else if (status === 'VOIDED') {
    console.log('❌ Pago ANULADO');

    // Actualizar Invoice a CANCELED
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'CANCELED' },
    });

    // TODO: Notificar al usuario
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

  return messages[status] || status;
}
