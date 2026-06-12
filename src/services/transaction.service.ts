import { TransactionRepository } from '../repositories/transaction.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceTicketsRepository } from '../repositories/invoicetickets.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventStagesRepository } from '../repositories/eventstages.repository';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../config/db';
import { InvoiceStatus } from '@prisma/client';
import axios from 'axios';
import { configManager } from '../utils/ConfigManager';
import { cleanString, createNumInvoice, getExpirationTime } from '../utils/utils';
import { PaymentMethodFactory } from './payment-methods/payment-method.factory';
import {
  PaymentMethodPayload,
  PaymentContext,
  WompiContext,
  NextAction,
} from './payment-methods/payment-method.base';

const transactionRepo  = new TransactionRepository();
const invoiceRepo      = new InvoiceRepository();
const invoiceTicketsRepo = new InvoiceTicketsRepository();
const eventRepo        = new EventRepository();
const stagesRepo       = new EventStagesRepository();
const userRepo         = new UserRepository();

/** Polling del recurso asíncrono (async_payment_url, QR, OTP) en Wompi */
const ASYNC_POLL_MAX_ATTEMPTS = 8;
const ASYNC_POLL_INTERVAL_MS  = 1500;

export class TransactionService {
  /**
   * Procesar transacción completa.
   *
   * Dos modos:
   *  - invoice_id presente → usa la factura creada previamente en POST /api/invoices
   *    (flujo recomendado: /invoice inicia la compra, aquí se ejecuta el pago)
   *  - sin invoice_id → crea Invoice + InvoiceTickets (flujo legacy)
   *
   * El método de pago llega en `payment_method` ({ type: 'NEQUI', ... }) y se
   * resuelve polimórficamente con PaymentMethodFactory. Por compatibilidad,
   * si no llega, se arma un CARD con token_card_user/installments_user.
   */
  async processTransaction(data: {
    user_id: number;
    user_uid: string;
    user_num_doc: string;
    user_type_doc: string;
    event_id?: number;
    qty_items?: number;
    apply_discount: number;
    amount_in_cents?: number;
    status?: string;
    customer_ID_phone: string;
    codeDCTO: string;
    paymentMethodType?: string;
    token_card_user?: string;
    installments_user?: number;
    shoppingCart?: any[];
    // ── Nuevos campos ──
    invoice_id?: number;
    sale_channel?: 'WEB' | 'APP';
    payment_method?: PaymentMethodPayload;
    redirect_url?: string;
  }) {
    // ── 0. Resolver el payload del método de pago (compatibilidad CARD legacy) ──
    const methodPayload: PaymentMethodPayload = data.payment_method?.type
      ? data.payment_method
      : {
          type: data.paymentMethodType || 'CARD',
          token: data.token_card_user,
          installments: data.installments_user,
        };

    // ── 1. Validar que el método esté soportado y activo en PaymentMethodsUI ──
    if (!PaymentMethodFactory.isSupported(methodPayload.type)) {
      throw new Error(`Método de pago no soportado: ${methodPayload.type}`);
    }

    const uiMethod = await prisma.paymentMethodsUI.findFirst({
      where: { method_code: methodPayload.type.toUpperCase() },
    });

    if (!uiMethod || uiMethod.method_status !== 1) {
      throw new Error(
        `El método de pago ${methodPayload.type} no está disponible actualmente`
      );
    }

    const method = PaymentMethodFactory.create(methodPayload.type);

    // ── 2. Lock del usuario + crear/cargar factura (transacción de BD corta,
    //       sin llamadas HTTP adentro) ──
    const { user, invoice } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.user_id },
        select: {
          id: true,
          firebase_uid: true,
          num_doc: true,
          type_doc: true,
          name: true,
          last_name: true,
          phone_number: true,
          email: true,
          status: true,
          role: true,
        },
      });

      if (!user) throw new Error('Usuario no encontrado');
      if (user.status === 99) {
        throw new Error('Ya hay un pago en proceso para este usuario');
      }

      // Bloquear usuario mientras procesa (evitar double-spending)
      await tx.user.update({
        where: { id: data.user_id },
        data: { status: 99 },
      });

      let invoice: import('@prisma/client').Invoice;

      if (data.invoice_id) {
        // Flujo recomendado: factura ya creada en POST /api/invoices
        const existing = await tx.invoice.findUnique({ where: { id: data.invoice_id } });

        if (!existing) throw new Error('Factura no encontrada');
        if (existing.user_id !== data.user_id) {
          throw new Error('La factura no pertenece a este usuario');
        }
        if (existing.status !== InvoiceStatus.ISSUED) {
          throw new Error(`La factura no está disponible para pago (status: ${existing.status})`);
        }

        // Registrar método y canal reales en la factura
        invoice = await tx.invoice.update({
          where: { id: existing.id },
          data: {
            payment_method: methodPayload.type.toUpperCase(),
            ...(data.sale_channel ? { sale_channel: data.sale_channel } : {}),
          },
        });
      } else {
        // Flujo legacy: crear Invoice + InvoiceTickets aquí
        // (el validador exige event_id, amount_in_cents y shoppingCart en este modo)
        const numInvoice = await createNumInvoice();
        const shoppingCart = data.shoppingCart ?? [];
        const amountInCents = data.amount_in_cents ?? 0;

        invoice = await tx.invoice.create({
          data: {
            user_id: data.user_id,
            user_uid: user.firebase_uid || '',
            num_invoice: numInvoice,
            user_name: user.name,
            user_lastname: user.last_name,
            user_num_doc: data.user_num_doc,
            user_type_doc: data.user_type_doc as any,
            num_items: shoppingCart.length,
            event_id: data.event_id as number,
            apply_discount: data.apply_discount,
            discount_type: 0,
            discount_value: 0,
            total_ticket_dcto: 0,
            total_ticket_regular: amountInCents / 100,
            total: amountInCents / 100,
            status: InvoiceStatus.ISSUED,
            payment_method: methodPayload.type.toUpperCase(),
            ...(data.sale_channel ? { sale_channel: data.sale_channel } : {}),
          },
        });

        await tx.invoiceTickets.createMany({
          data: shoppingCart.map((item: any) => ({
            invoice_id: invoice.id,
            stage_id: item.stage_id,
            stage_name: item.stage_name,
            locality_id: item.locality_id,
            locality_name: item.locality_name,
            qty_tickets: 1,
            price_ticket: item.ticket_price,
            apply_discount: 0,
            discount_type: 0,
            discount_value: 0,
            total_ticket_dcto: 0,
            total_ticket_regular: item.ticket_final_price,
            total_ticket_paid: item.ticket_final_price,
            purchase_date: new Date(),
            status_item: 0,
          })),
        });
      }

      return { user, invoice };
    });

    // El monto a cobrar siempre sale de la factura (no del front)
    const amount_in_cents = data.invoice_id
      ? Math.round(invoice.total * 100)
      : (data.amount_in_cents as number);

    try {
      // ── 3. Preparar contexto y ejecutar el pago en Wompi (fuera de la tx de BD) ──
      const currency        = 'COP';
      const expiration_time = await getExpirationTime();
      const customer_email  = user.email;
      const customer_data = {
        phone_number: user.phone_number,
        full_name: `${user.name} ${user.last_name}`,
        legal_id: data.user_num_doc || user.num_doc || '',
        legal_id_type: (data.user_type_doc || user.type_doc || 'CC') as string,
      };
      const redirect_url =
        data.redirect_url ||
        process.env.WOMPI_REDIRECT_URL ||
        'https://tu-dominio.com/pago/resultado';

      const paymentResult = await this.sendTransaction(method, methodPayload, {
        amount_in_cents,
        currency,
        expiration_time,
        customer_email,
        customer_data,
        redirect_url,
        reference: invoice.num_invoice,
      });

      console.log('✅ Resultado del pago:', JSON.stringify(paymentResult, null, 2));

      if (paymentResult.status !== 'success') {
        throw new Error(`Pago fallido: ${paymentResult.message}`);
      }

      // ── 4. Crear registro en Transactions y desbloquear usuario ──
      const transaction = await prisma.transactions.create({
        data: {
          user_id: data.user_id,
          user_uid: user.firebase_uid || '',
          invoice_id: invoice.num_invoice,
          created_at: new Date(),
          finalized_at: new Date(),
          amount_in_cents,
          reference: invoice.num_invoice,
          customer_email: customer_email,
          currency: currency,
          payment_method_type: methodPayload.type.toUpperCase(),
          payment_method: paymentResult.wompi_payment_method ?? {
            type: methodPayload.type.toUpperCase(),
          },
          status: 'PENDING',
          status_message: 'Transacción iniciada. Esperando confirmación de Wompi.',
          billing_data: JSON.stringify(customer_data),
          shipping_address: '',
          redirect_url,
          payment_source_id: String(paymentResult.payment_source_id || ''),
          payment_link_id: '',
          customer_data: JSON.stringify(customer_data),
          bill_id: '',
          taxes: [],
          tip_in_cents: '0',
          meta: {
            customer_ID_phone: data.customer_ID_phone,
            codeDCTO: data.codeDCTO,
            sale_channel: data.sale_channel || 'WEB',
            wompi_transaction_id: paymentResult.wompi_transaction_id,
            next_action: paymentResult.next_action as any,
          },
        },
      });

      await prisma.user.update({
        where: { id: data.user_id },
        data: { status: 1 },
      });

      return {
        invoice,
        transaction,
        paymentResult,
        // Lo que el front debe hacer a continuación (redirigir, mostrar QR, OTP, etc.)
        next_action: paymentResult.next_action,
        message: 'Transacción procesada. Esperando confirmación de Wompi.',
      };
    } catch (error: any) {
      await prisma.user.update({
        where: { id: data.user_id },
        data: { status: 1 },
      });
      throw error;
    }
  }

  /**
   * Enviar transacción a Wompi usando la clase polimórfica del método de pago.
   */
  private async sendTransaction(
    method: import('./payment-methods/payment-method.base').WompiPaymentMethod,
    payload: PaymentMethodPayload,
    params: {
      amount_in_cents: number;
      currency: string;
      expiration_time: string;
      customer_email: string;
      customer_data: any;
      redirect_url: string;
      reference: string;
    }
  ): Promise<{
    status: 'success' | 'failed';
    message: string;
    wompi_transaction_id?: string;
    payment_source_id?: number | string;
    wompi_payment_method?: any;
    next_action?: NextAction;
    reference?: string;
  }> {
    try {
      const wompiUrl             = configManager.getWompiUrl();
      const tokenAcceptance      = configManager.getWompiTokenAcceptance();
      const cleanTokenAcceptance = cleanString(tokenAcceptance);
      const urlMerchants         = `${wompiUrl}/${cleanTokenAcceptance}`;
      const prvCertificate       = cleanString(configManager.paymentSources());

      const merchantsResponse = await axios.get(urlMerchants);
      const merchantData      = merchantsResponse.data.data;
      // Tokens de aceptación Wompi (Habeas Data): política de privacidad +
      // autorización de tratamiento de datos personales. El usuario debe haber
      // aceptado ambos contratos en la UI (checkboxes) antes de llegar aquí.
      const acceptanceToken   = merchantData.presigned_acceptance?.acceptance_token;
      const personalAuthToken = merchantData.presigned_personal_data_auth?.acceptance_token;

      const wompiCtx: WompiContext = {
        wompiUrl,
        acceptanceToken,
        personalAuthToken,
        headers: {
          Authorization: `Bearer ${prvCertificate}`,
          'Content-Type': 'application/json',
        },
      };

      const paymentCtx: PaymentContext = {
        reference: params.reference,
        amount_in_cents: params.amount_in_cents,
        currency: params.currency,
        customer_email: params.customer_email,
        customer_data: params.customer_data,
        redirect_url: params.redirect_url,
        expiration_time: params.expiration_time,
      };

      // 1. Validación específica del método (reglas en la clase)
      method.validate(payload, paymentCtx);

      // 2. Pasos previos (ej: CARD crea payment_source) → campos extra del body
      const extraFields = await method.prepare(wompiCtx, payload, paymentCtx);

      // 3. Firma de integridad
      const signature = await configManager.getSignature(
        params.reference,
        params.amount_in_cents,
        params.currency,
        params.expiration_time
      );

      // 4. Crear la transacción
      const paymentMethodBody = method.buildPaymentMethod(payload);
      const transactionData: Record<string, any> = {
        acceptance_token: acceptanceToken,
        ...(personalAuthToken ? { accept_personal_auth: personalAuthToken } : {}),
        amount_in_cents: params.amount_in_cents,
        currency: params.currency,
        signature,
        customer_email: params.customer_email,
        redirect_url: params.redirect_url,
        reference: params.reference,
        expiration_time: params.expiration_time,
        customer_data: params.customer_data,
        ...extraFields,
      };
      if (paymentMethodBody) transactionData.payment_method = paymentMethodBody;
      // Segunda transacción PCOL (pago del saldo con otro método)
      if (payload.parent_transaction_id) {
        transactionData.parent_transaction_id = payload.parent_transaction_id;
      }

      const transactionResponse = await axios.post(
        `${wompiUrl}/transactions`,
        transactionData,
        { headers: wompiCtx.headers }
      );

      let wompiTransaction = transactionResponse.data.data;
      console.log('✅ Transacción creada en Wompi:', wompiTransaction.id);

      // 5. Polling del recurso asíncrono si el método lo requiere
      //    (async_payment_url, qr_image, url OTP, códigos de convenio)
      if (method.needsAsyncResource && !method.hasAsyncResource(wompiTransaction)) {
        wompiTransaction = await this.pollAsyncResource(
          wompiCtx,
          wompiTransaction.id,
          method
        );
      }

      return {
        status: 'success',
        payment_source_id: (extraFields as any).payment_source_id,
        wompi_transaction_id: wompiTransaction.id,
        wompi_payment_method: wompiTransaction.payment_method,
        next_action: method.extractNextAction(wompiTransaction),
        reference: params.reference,
        message: 'Transacción iniciada exitosamente',
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Wompi Error:', JSON.stringify(error.response?.data));
        return {
          status: 'failed',
          message:
            error.response?.data?.error?.reason ||
            JSON.stringify(error.response?.data?.error?.messages) ||
            'Error desconocido de Wompi',
        };
      }
      console.error('❌ Error procesando pago:', error.message);
      return { status: 'failed', message: error.message || 'Error al procesar el pago' };
    }
  }

  /**
   * Long polling a GET /transactions/:id hasta que aparezca el recurso
   * asíncrono que el front necesita (URL de pago, QR, OTP, convenio).
   */
  private async pollAsyncResource(
    wompiCtx: WompiContext,
    wompiTransactionId: string,
    method: import('./payment-methods/payment-method.base').WompiPaymentMethod
  ): Promise<any> {
    let lastTransaction: any = null;

    for (let attempt = 1; attempt <= ASYNC_POLL_MAX_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, ASYNC_POLL_INTERVAL_MS));

      const response = await axios.get(
        `${wompiCtx.wompiUrl}/transactions/${wompiTransactionId}`,
        { headers: wompiCtx.headers }
      );
      lastTransaction = response.data.data;

      if (method.hasAsyncResource(lastTransaction)) {
        console.log(`✅ [${method.code}] Recurso async disponible (intento ${attempt})`);
        return lastTransaction;
      }
    }

    console.warn(
      `⚠️ [${method.code}] Recurso async no disponible tras ${ASYNC_POLL_MAX_ATTEMPTS} intentos. ` +
      'El front deberá consultar el estado de la transacción.'
    );
    return lastTransaction;
  }

  /**
   * Obtener transacciones de un usuario
   */
  async getUserTransactions(userId: number) {
    return transactionRepo.findByUserId(userId);
  }

  /**
   * Obtener transacción por ID
   * Verifica que el usuario sea el dueño o sea PAYPAC
   */
  async getTransactionById(id: number, userId: number, userRole: string) {
    const transaction = await transactionRepo.findById(id);
    if (!transaction) throw new Error('Transacción no encontrada');

    const isOwner  = transaction.user_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) throw new Error('No tienes permisos para ver esta transacción');

    return transaction;
  }

  /**
   * Obtener transacción por reference (num_invoice)
   * Solo PAYPAC
   */
  async getTransactionByReference(reference: string, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede buscar por referencia');

    const transaction = await transactionRepo.findByReference(reference);
    if (!transaction) throw new Error(`Transacción con referencia "${reference}" no encontrada`);

    return transaction;
  }

  /**
   * Obtener todas las transacciones
   * solo PAYPAC
   */
  async getAllTransactions(userRole: string) {
  if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede ver todas las transacciones');
  return transactionRepo.findAll();
}

  /**
   * Obtener transacción por invoice_id
   * Solo PAYPAC
   */
  async getTransactionByInvoiceId(invoiceId: string, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede buscar por invoice');

    const transaction = await transactionRepo.findByInvoiceId(invoiceId);
    if (!transaction) throw new Error(`Transacción con invoice "${invoiceId}" no encontrada`);

    return transaction;
  }

  /**
   * Obtener todas las transacciones por status
   * Solo PAYPAC — vista administrativa
   */
  async getTransactionsByStatus(status: string, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede filtrar por status');

    const validStatuses = ['APPROVED', 'PENDING', 'DECLINED', 'VOIDED', 'ERROR'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido. Valores permitidos: ${validStatuses.join(', ')}`);
    }

    return transactionRepo.findByStatus(status);
  }
}
