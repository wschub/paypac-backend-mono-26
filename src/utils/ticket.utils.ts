import crypto from 'crypto';

/**
 * Generar reference_ticket único (token alfanumérico)
 * Formato: TKT-{timestamp}-{random}
 */
export function generateReferenceTicket(): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
  const random = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 caracteres hex
  return `TKT-${timestamp}-${random}`;
}

/**
 * Generar booking_ticket (número de factura)
 * Formato: PYC-{random4}-{timestamp2}
 */
export function generateBookingTicket(): string {
  const random = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  const timestamp = Date.now().toString().slice(-2); // Últimos 2 dígitos del timestamp
  return `PYC-${random}-${timestamp}`;
}

/**
 * Generar token_ticket seguro (hash SHA-256)
 * token = SHA256(reference_ticket + booking_ticket + customer_ID_phone)
 * 
 * @param referenceTicket - Token único del ticket
 * @param bookingTicket - Número de factura
 * @param customerIdPhone - ID del teléfono del dueño actual
 * @returns Token hash de 32 caracteres
 */
export function generateTicketToken(
  referenceTicket: string,
  bookingTicket: string,
  customerIdPhone: string
): string {
  const raw = `${referenceTicket}-${bookingTicket}-${customerIdPhone}`;
  
  // Hash SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex')
    .substring(0, 32); // Primeros 32 caracteres
  
  return hash.toUpperCase();
}

/**
 * Validar token_ticket
 * Compara el token del QR con el token esperado
 * 
 * @param qrToken - Token leído del QR
 * @param ticket - Datos del ticket desde la BD
 * @returns true si el token es válido
 */
export function validateTicketToken(
  qrToken: string,
  ticket: {
    reference_ticket: string;
    booking_ticket: string;
    customer_ID_phone: string;
  }
): boolean {
  const expectedToken = generateTicketToken(
    ticket.reference_ticket,
    ticket.booking_ticket,
    ticket.customer_ID_phone
  );
  
  return qrToken === expectedToken;
}

/**
 * Generar datos completos para un nuevo ticket
 */
export function generateTicketData(customerIdPhone: string) {
  const referenceTicket = generateReferenceTicket();
  const bookingTicket = generateBookingTicket();
  const tokenTicket = generateTicketToken(
    referenceTicket,
    bookingTicket,
    customerIdPhone
  );
  
  return {
    reference_ticket: referenceTicket,
    booking_ticket: bookingTicket,
    token_ticket: tokenTicket,
  };
}

/**
 * Regenerar token al transferir ticket
 * Solo cambia el customer_ID_phone, reference_ticket y booking_ticket se mantienen
 */
export function regenerateTokenOnTransfer(
  referenceTicket: string,
  bookingTicket: string,
  newCustomerIdPhone: string
): string {
  return generateTicketToken(
    referenceTicket,
    bookingTicket,
    newCustomerIdPhone
  );
}

/**
 * Encriptar datos sensibles (opcional, para QR)
 */
export function encryptQRData(data: string, secret: string): string {
  //const cipher = crypto.createCipher('aes-256-cbc', secret);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(secret, 'salt', 32), Buffer.alloc(16, 0));
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Desencriptar datos del QR (opcional)
 */
export function decryptQRData(encryptedData: string, secret: string): string {
  //const decipher = crypto.createDecipher('aes-256-cbc', secret);
  const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(secret, 'salt', 32), Buffer.alloc(16, 0));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}