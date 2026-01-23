import { TransactionRepository } from '../repositories/transaction.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceTicketsRepository } from '../repositories/invoicetickets.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventStagesRepository } from '../repositories/eventStages.repository';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../config/db';
import { InvoiceStatus } from '@prisma/client';
import axios from 'axios';
import { configManager } from '../utils/ConfigManager';
import { cleanString, createNumInvoice, getExpirationTime } from '../utils/utils';

const transactionRepo = new TransactionRepository();
const invoiceRepo = new InvoiceRepository();
const invoiceTicketsRepo = new InvoiceTicketsRepository();
const eventRepo = new EventRepository();
const stagesRepo = new EventStagesRepository();
const userRepo = new UserRepository();

export class TransactionService {
  /**
   * Procesar transacción completa
   * Crea Invoice + InvoiceTickets + Transaction + Llama a Wompi
   */
  async processTransaction(data: {
    user_id: number;
    user_uid: string;
    user_num_doc: string;
    user_type_doc: string;
    event_id: number;
    qty_items: number;
    apply_discount: number;
    amount_in_cents: number;
    status: string;
    customer_ID_phone: string;
    codeDCTO: string;
    paymentMethodType: string;
    token_card_user: string;
    installments_user: number;
    shoppingCart: any[];
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Obtener datos del usuario
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

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 2. Bloquear usuario mientras procesa (evitar double-spending)
      await tx.user.update({
        where: { id: data.user_id },
        data: { status: 99 }, // 99 = Bloqueado temporalmente
      });

      try {
        // 3. Crear Invoice
        const numInvoice = await createNumInvoice();
        
        const invoice = await tx.invoice.create({
          data: {
            user_id: data.user_id,
            user_uid: user.firebase_uid || '',
            num_invoice: numInvoice,
            user_name: user.name,
            user_lastname: user.last_name,
            user_num_doc: data.user_num_doc,
            user_type_doc: parseInt(data.user_type_doc),
            num_items: data.shoppingCart.length,
            event_id: data.event_id,
            apply_discount: data.apply_discount,
            discount_type: 0,
            discount_value: 0,
            total_ticket_dcto: 0,
            total_ticket_regular: data.amount_in_cents / 100,
            total: data.amount_in_cents / 100,
            status: InvoiceStatus.ISSUED, // Emitida, esperando pago
          },
        });

        // 4. Crear InvoiceTickets
        await tx.invoiceTickets.createMany({
          data: data.shoppingCart.map((item: any) => ({
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
            status_item: 0, // Pendiente
          })),
        });

        // 5. Preparar datos para Wompi
        const currency = 'COP';
        const expiration_time = await getExpirationTime();

        const customer_email = user.email;
        const payment_method_type = data.paymentMethodType;
        const customer_data = {
          phone_number: user.phone_number,
          full_name: `${user.name} ${user.last_name}`,
          legal_id: data.user_num_doc,
          legal_id_type: 'CC',
        };

        // 6. Ejecutar pago con Wompi
        const paymentResult = await this.sendTransaction({
          amount_in_cents: data.amount_in_cents,
          currency,
          expiration_time,
          token_card_user: data.token_card_user,
          installments_user: data.installments_user,
          customer_email,
          payment_method_type,
          customer_data,
          reference: numInvoice, // 🆕 Usar num_invoice como reference
        });

        console.log('✅ Resultado del pago:', paymentResult);

        if (paymentResult.status !== 'success') {
          // Si falla el pago, desbloquear usuario y lanzar error
          await tx.user.update({
            where: { id: data.user_id },
            data: { status: 1 }, // Activar de nuevo
          });

          throw new Error(`Pago fallido: ${paymentResult.message}`);
        }

        // 7. Crear registro en Transactions
        const transaction = await tx.transactions.create({
          data: {
            user_id: data.user_id,
            user_uid: user.firebase_uid || '',
            invoice_id: numInvoice,
            created_at: new Date(),
            finalized_at: new Date(),
            amount_in_cents: data.amount_in_cents,
            reference: numInvoice,
            customer_email: customer_email,
            currency: currency,
            payment_method_type: payment_method_type,
            payment_method: {
              type: payment_method_type,
              installments: data.installments_user,
            },
            status: 'PENDING', // 🆕 Esperando webhook de Wompi
            status_message: 'Transacción iniciada. Esperando confirmación de Wompi.',
            billing_data: JSON.stringify(customer_data),
            shipping_address: '',
            redirect_url: 'https://tu-dominio.com/pago/resultado',
            payment_source_id: paymentResult.payment_source_id || '',
            payment_link_id: '',
            customer_data: JSON.stringify(customer_data),
            bill_id: '',
            taxes: [],
            tip_in_cents: '0',
            meta: {
              customer_ID_phone: data.customer_ID_phone,
              codeDCTO: data.codeDCTO,
              wompi_transaction_id: paymentResult.wompi_transaction_id,
            },
          },
        });

        // 8. Desbloquear usuario
        await tx.user.update({
          where: { id: data.user_id },
          data: { status: 1 },
        });

        // 9. 🆕 NO crear Tickets aquí
        // Se crearán cuando Wompi envíe el webhook con status APPROVED

        return {
          invoice,
          transaction,
          paymentResult,
          message: 'Transacción procesada. Esperando confirmación de Wompi.',
        };
      } catch (error: any) {
        // Si hay error, desbloquear usuario
        await tx.user.update({
          where: { id: data.user_id },
          data: { status: 1 },
        });

        throw error;
      }
    });
  }

  /**
   * Enviar transacción a Wompi
   */
  private async sendTransaction(params: {
    amount_in_cents: number;
    currency: string;
    expiration_time: string;
    token_card_user: string;
    installments_user: number;
    customer_email: string;
    payment_method_type: string;
    customer_data: any;
    reference: string;
  }) {
    try {
      const wompiUrl = configManager.getWompiUrl();
      const tokenAcceptance = configManager.getWompiTokenAcceptance();
      const cleanTokenAcceptance = cleanString(tokenAcceptance);
      const urlMerchants = `${wompiUrl}/${cleanTokenAcceptance}`;
      const prvCertificate = cleanString(configManager.paymentSources());

      // 1. Obtener acceptance token
      const merchantsResponse = await axios.get(urlMerchants);
      const acceptanceToken =
        merchantsResponse.data.data.presigned_acceptance.acceptance_token;

      // 2. Validar token de tarjeta
      if (!params.token_card_user || params.token_card_user.trim() === '') {
        throw new Error('Token de tarjeta no válido');
      }

      // 3. Crear payment source
      const paymentSourceUrl = `${wompiUrl}/payment_sources`;
      const paymentData = {
        type: 'CARD',
        token: params.token_card_user,
        acceptance_token: acceptanceToken,
        customer_email: params.customer_email,
      };

      const headers = {
        Authorization: `Bearer ${prvCertificate}`,
        'Content-Type': 'application/json',
      };

      const paymentSourceResponse = await axios.post(
        paymentSourceUrl,
        paymentData,
        { headers }
      );
      const payment_source_id = paymentSourceResponse.data.data.id;

      console.log('✅ Payment source creado:', payment_source_id);

      // 4. Generar signature
      const signature = await configManager.getSignature(
        params.reference,
        params.amount_in_cents,
        params.currency,
        params.expiration_time
      );

      // 5. Crear transacción en Wompi
      const transactionUrl = `${wompiUrl}/transactions`;
      const transactionData = {
        acceptance_token: acceptanceToken,
        amount_in_cents: params.amount_in_cents,
        currency: params.currency,
        signature: signature,
        customer_email: params.customer_email,
        payment_method: {
          installments: params.installments_user,
        },
        payment_source_id: payment_source_id,
        redirect_url: 'https://tu-dominio.com/pago/resultado',
        reference: params.reference,
        expiration_time: params.expiration_time,
        customer_data: params.customer_data,
      };

      const transactionResponse = await axios.post(
        transactionUrl,
        transactionData,
        { headers }
      );

      console.log('✅ Transacción creada en Wompi:', transactionResponse.data);

      return {
        status: 'success',
        payment_source_id: payment_source_id,
        wompi_transaction_id: transactionResponse.data.data.id,
        reference: params.reference,
        message: 'Transacción iniciada exitosamente',
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Wompi Error:', error.response?.data);
        return {
          status: 'failed',
          message:
            error.response?.data?.error?.reason || 'Error desconocido de Wompi',
        };
      }

      console.error('❌ Error desconocido:', error);
      return {
        status: 'failed',
        message: 'Error al procesar el pago',
      };
    }
  }

  /**
   * Obtener transacciones de un usuario
   */
  async getUserTransactions(userId: number) {
    return transactionRepo.findByUserId(userId);
  }

  /**
   * Obtener transacción por ID
   */
  async getTransactionById(id: number, userId: number, userRole: string) {
    const transaction = await transactionRepo.findById(id);

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Verificar permisos
    const isOwner = transaction.user_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver esta transacción');
    }

    return transaction;
  }
}
