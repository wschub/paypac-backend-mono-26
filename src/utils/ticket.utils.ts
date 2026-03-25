import crypto from 'crypto';
import { generateKeyPairSync, createSign, createVerify } from 'crypto';


/**
 * Generar reference_ticket único (token alfanumérico)
 * Formato: TKT-{timestamp}-{random}
 */
export function generateReferenceTicket(): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
  const random = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 caracteres hex
  return `PYC-${timestamp}-${random}`;
}

/**
 * Generar booking_ticket (número de factura)
 * Formato: PYC-{random4}-{timestamp2}
 */
export function generateBookingTicket(): string {
  const random = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  const timestamp = Date.now().toString().slice(-2); // Últimos 2 dígitos del timestamp
  return `EVP-${random}-${timestamp}`;
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
  const totpSecret = generateTotpSecret(); 

  return {
    reference_ticket: referenceTicket,
    booking_ticket: bookingTicket,
    token_ticket: tokenTicket,
    totp_secret:      totpSecret,
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

/**
 * Generar secreto TOTP único por ticket
 * Base32 de 16 caracteres — compatible con Google Authenticator
 */
export function generateTotpSecret(): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(16);
  let secret = '';
  for (const byte of bytes) {
    secret += base32Chars[byte % 32];
  }
  return secret;
}


/**
 * Generar código TOTP de 6 dígitos
 * Compatible con ventana de 30 segundos
 */
export function generateTOTPCode(secret: string, timeWindow?: number): string {
  const window = timeWindow ?? Math.floor(Date.now() / 30000);
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(window.toString());
  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Validar código TOTP con tolerancia ±1 ventana (90s total)
 * Para compensar desfase de reloj entre customer y backend
 */
export function validateTOTPCode(code: string, secret: string): boolean {
  const currentWindow = Math.floor(Date.now() / 30000);
  for (let i = -1; i <= 1; i++) {
    if (generateTOTPCode(secret, currentWindow + i) === code) {
      return true;
    }
  }
  return false;
}

//NFC
/**
 * Generar par de claves RSA para NFC challenge-response
 * Se llama desde la app al registrarse o al recibir un ticket
 */
export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding:  { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

/**
 * Verificar firma RSA del challenge
 * Backend verifica que el customer firmó con su private key
 */
export function verifyRSASignature(
  challenge:  string,
  signature:  string,
  publicKey:  string
): boolean {
  try {
    const verify = createVerify('SHA256');
    verify.update(challenge);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}

/**
 * Generar challenge NFC — random 32 bytes
 */
export function generateNFCChallenge(): string {
  return crypto.randomBytes(32).toString('hex');
}