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
 */
export const wompiWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('🔔 Webhook recibido de Wompi:', JSON.stringify(req.body, null, 2));
    

   
    const webhookData = req.body as WompiWebhookEvent;
    const { event, data, signature, timestamp, environment } = webhookData;
 /*
    // 1. Verificar firma del webhook
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
*/
    // 3. Procesar según el tipo de evento
    if (event === 'transaction.updated') {
      await handleTransactionUpdated(data.transaction);
    } else {
      console.log(`ℹ️ Evento no manejado: ${event}`);
    }

    // 4. Responder a Wompi (IMPORTANTE: siempre 200)
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error.message);
    // Aún así respondemos 200 para que Wompi no reintente
    res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Manejar actualización de transacción
 */
async function handleTransactionUpdated(transaction: any) {
  console.log('📨 Procesando transacción:', transaction);

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

  // 1. Buscar Invoice por reference
  const invoice = await prisma.invoice.findFirst({
    where: { num_invoice: reference },
    //include: {
      //invoice_tickets: true, // Incluir items para crear tickets
    //},
  });

  if (!invoice) {
    console.error(`❌ Invoice no encontrada para reference: ${reference}`);
    return;
  }

  console.log(`✅ Invoice encontrada: ${invoice.id} - ${invoice.num_invoice}`);

  // 2. Verificar que no se haya procesado ya
  const existingTransaction = await transactionRepo.findByReference(reference);
  
  if (existingTransaction && existingTransaction.status === 'APPROVED' && status === 'APPROVED') {
    console.log('⚠️ Transacción ya procesada anteriormente. Ignorando webhook duplicado.');
    return;
  }

  // 3. Crear o actualizar Transaction
  let transactionRecord;

  if (existingTransaction) {
    console.log(`✅ Actualizando Transaction: ${existingTransaction.id}`);
    
    transactionRecord = await transactionRepo.update(existingTransaction.id, {
      status: status,
      status_message: getStatusMessage(status),
      finalized_at: finalized_at ? new Date(finalized_at) : new Date(),
      payment_method: payment_method || {},
      customer_data: JSON.stringify(customer_data || {}),
      meta: {
        ...((existingTransaction.meta as any) || {}),
        wompi_transaction_id,
        wompi_status: status,
        updated_at: new Date().toISOString(),
      },
    });
  } else {
    console.log('⚠️ Creando nueva Transaction...');

    // Extraer teléfono del customer_data
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
      },
    });
  }

  // 4. Procesar según el estado
  if (status === 'APPROVED') {
    console.log('✅ Pago APROBADO. Creando tickets...');

    try {
      // Extraer customer_ID_phone
      const meta = (transactionRecord.meta as any) || {};
      const customer_ID_phone = meta.customer_ID_phone || 
                               customer_data?.phone_number || 
                               customer_data?.legal_id || 
                               'UNKNOWN';

      // 🎫 Crear Tickets
      await invoiceService.updateInvoiceStatus(
        invoice.id,
        transactionRecord.id,
        'PAID',
        customer_ID_phone
      );

      console.log(`✅ Tickets creados exitosamente para Invoice ${invoice.num_invoice}`);

      // TODO: Enviar notificación push via Socket.IO o Firebase
      // TODO: Enviar email con QR de tickets
      
    } catch (error: any) {
      console.error('❌ Error al crear tickets:', error.message);

      // Registrar error en meta de la transacción
      await transactionRepo.update(transactionRecord.id, {
        status_message: `Error al crear tickets: ${error.message}`,
        meta: {
          ...((transactionRecord.meta as any) || {}),
          ticket_creation_error: error.message,
          ticket_creation_error_date: new Date().toISOString(),
        },
      });
    }
  } 
  else if (status === 'DECLINED' || status === 'ERROR') {
    console.log(`❌ Pago ${status}`);

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'REJECTED' },
    });

    // TODO: Notificar al usuario del rechazo
  } 
  else if (status === 'VOIDED') {
    console.log('❌ Pago ANULADO');

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'CANCELED' },
    });

    // TODO: Anular tickets si ya se crearon
  }
  else if (status === 'PENDING') {
    console.log('⏳ Pago PENDIENTE');
    
    // Mantener Invoice en ISSUED
    // No hacer nada, esperar siguiente webhook
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