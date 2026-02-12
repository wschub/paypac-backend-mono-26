/**
 * Tipos de datos de Wompi
 * Basados en la documentación oficial de Wompi
 */

/**
 * Evento del webhook de Wompi
 */
export interface WompiWebhookEvent {
  event: WompiEventType;
  data: WompiEventData;
  environment: 'test' | 'production';
  signature: WompiSignature;
  timestamp: number; // UNIX timestamp
  sent_at: string; // ISO 8601 date
}

/**
 * Tipos de eventos soportados por Wompi
 */
export type WompiEventType =
  | 'transaction.updated'
  | 'nequi_token.updated'
  | 'bancolombia_transfer_token.updated';

/**
 * Datos del evento
 */
export interface WompiEventData {
  transaction?: WompiTransaction;
  nequi_token?: any;
  bancolombia_transfer_token?: any;
}

/**
 * Transacción de Wompi
 */
export interface WompiTransaction {
  id: string;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: WompiPaymentMethodType;
  payment_method?: any;
  redirect_url: string | null;
  status: WompiTransactionStatus;
  status_message?: string;
  shipping_address: any | null;
  payment_link_id: string | null;
  payment_source_id: number | null;
  customer_data?: WompiCustomerData;
  created_at: string;
  finalized_at: string | null;
}

/**
 * Status de transacción en Wompi
 */
export type WompiTransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

/**
 * Tipos de método de pago
 */
export type WompiPaymentMethodType = 'CARD' | 'NEQUI' | 'PSE' | 'BANCOLOMBIA_TRANSFER';

/**
 * Datos del cliente
 */
export interface WompiCustomerData {
  phone_number?: string;
  full_name?: string;
  legal_id?: string;
  legal_id_type?: string;
}

/**
 * Firma del webhook
 */
export interface WompiSignature {
  properties: string[]; // Lista de propiedades usadas para calcular el checksum
  checksum: string; // Hash SHA256
}

/**
 * Request para crear transacción en Wompi
 */
export interface WompiTransactionRequest {
  acceptance_token: string;
  amount_in_cents: number;
  currency: string;
  signature: string;
  customer_email: string;
  payment_method: {
    installments: number;
  };
  payment_source_id: number;
  redirect_url: string;
  reference: string;
  expiration_time: string;
  customer_data: WompiCustomerData;
}

/**
 * Response de Wompi al crear transacción
 */
export interface WompiTransactionResponse {
  data: WompiTransaction;
  meta: any;
}

/**
 * Request para crear payment source
 */
export interface WompiPaymentSourceRequest {
  type: 'CARD';
  token: string;
  acceptance_token: string;
  customer_email: string;
}

/**
 * Response de Wompi al crear payment source
 */
export interface WompiPaymentSourceResponse {
  data: {
    id: number;
    type: string;
    status: string;
    token: string;
    customer_email: string;
  };
}
