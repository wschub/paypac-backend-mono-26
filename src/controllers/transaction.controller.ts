import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import { configManager } from '../utils/ConfigManager';
import { createNumInvoice, paramToInt, paramToString } from '../utils/utils';

const transactionService = new TransactionService();

/**
 * POST /api/transactions/signature
 * Generar signature para el frontend
 */
export const signature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, expiration_date } = req.body;

    const reference    = await createNumInvoice();
    const getSignature = await configManager.getSignature(
      reference,
      amount,
      currency,
      expiration_date
    );

    console.log('✅ Signature generada:', { reference, signature: getSignature });

    res.status(200).json({
      success: true,
      reference,
      signature: getSignature,
    });
  } catch (err: any) {
    console.error('❌ Error generando signature:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/transactions/process
 * Procesar transacción completa
 */
export const processTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id, user_uid, user_num_doc, user_type_doc,
      event_id, qty_items, apply_discount, amount_in_cents,
      status, customer_ID_phone, codeDCTO, paymentMethodType,
      token_card_user, installments_user, shoppingCart,
    } = req.body;

    console.log('📨 Procesando transacción:', { user_id, event_id, amount_in_cents });

    const result = await transactionService.processTransaction({
      user_id, user_uid, user_num_doc, user_type_doc,
      event_id, qty_items, apply_discount, amount_in_cents,
      status, customer_ID_phone, codeDCTO, paymentMethodType,
      token_card_user, installments_user, shoppingCart,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      invoice: result.invoice,
      transaction: result.transaction,
      payment_result: result.paymentResult,
    });
  } catch (err: any) {
    console.error('❌ Error procesando transacción:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transactions/my-transactions
 * Obtener mis transacciones
 */
export const getMyTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId       = req.user!.id;
    const transactions = await transactionService.getUserTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transactions/:id
 * Obtener transacción por ID — dueño o PAYPAC
 */
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = paramToInt(req.params.id);
    const userId        = req.user!.id;
    const userRole      = req.user!.role;

    const transaction = await transactionService.getTransactionById(
      transactionId,
      userId,
      userRole
    );

    res.status(200).json({ success: true, transaction });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transactions/by-reference/:reference
 * Buscar transacción por reference (num_invoice) — solo PAYPAC
 */
export const getTransactionByReference = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole    = req.user!.role;
    //const { reference } = req.params;
    const reference = paramToString(req.params.reference);

    const transaction = await transactionService.getTransactionByReference(reference, userRole);

    res.status(200).json({ success: true, transaction });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transactions/by-invoice/:invoice_id
 * Buscar transacción por invoice_id — solo PAYPAC
 */
export const getTransactionByInvoiceId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole    = req.user!.role;
    //const { invoice_id } = req.params;
    const invoiceId = paramToString(req.params.invoice_id);
    const transaction = await transactionService.getTransactionByInvoiceId(invoiceId, userRole);

    res.status(200).json({ success: true, transaction });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transactions/by-status/:status
 * Listar transacciones por status — solo PAYPAC (vista administrativa)
 */
export const getTransactionsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user!.role;
    //const { status } = req.params;
    const status = paramToString(req.params.status);
    const transactions = await transactionService.getTransactionsByStatus(status, userRole);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};