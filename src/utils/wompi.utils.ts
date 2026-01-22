import crypto from 'crypto';
import { WompiWebhookEvent } from '../types/wompi.types';

/**
 * Verificar firma del webhook de Wompi
 * Documentación: https://docs.wompi.co/docs/eventos-1#verificaci%C3%B3n-de-firma
 */
export function verifyWompiSignature(payload: WompiWebhookEvent): boolean {
  try {
    const { event, data, timestamp, signature } = payload;

    // 1. Obtener el secret del webhook desde variables de entorno
    const webhookSecret = process.env.WOMPI_EVENTS_SECRET;

    if (!webhookSecret) {
      console.error('❌ WOMPI_EVENTS_SECRET no configurado en .env');
      return false;
    }

    // 2. Extraer valores de las propiedades especificadas
    const propertyValues = signature.properties.map((prop) => {
      return getNestedProperty(data, prop);
    });

    // 3. Concatenar valores de properties
    const propertiesString = propertyValues.join('');

    // 4. Concatenar timestamp
    const stringWithTimestamp = propertiesString + timestamp.toString();

    // 5. Concatenar secret
    const stringToSign = stringWithTimestamp + webhookSecret;

    console.log('🔐 Calculando firma...');
    console.log('Properties:', propertyValues);
    console.log('String a firmar:', stringToSign);

    // 6. Generar checksum con SHA256
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    const receivedChecksum = signature.checksum.toUpperCase();

    console.log('Expected checksum:', expectedChecksum);
    console.log('Received checksum:', receivedChecksum);

    // 7. Comparar checksums
    const isValid = expectedChecksum === receivedChecksum;

    if (!isValid) {
      console.error('❌ Firma inválida:', {
        expected: expectedChecksum,
        received: receivedChecksum,
      });
    }

    return isValid;
  } catch (error: any) {
    console.error('❌ Error verificando firma:', error.message);
    return false;
  }
}

/**
 * Obtener valor de una propiedad anidada
 * Ejemplo: "transaction.status" → data.transaction.status
 */
function getNestedProperty(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return '';
    }
  }

  return value !== null && value !== undefined ? value : '';
}

/**
 * Validar que el ambiente del webhook coincida con la configuración
 */
export function validateWebhookEnvironment(environment: string): boolean {
  const expectedEnv = process.env.WOMPI_MODE === 'sandbox' ? 'test' : 'prod';
  return environment === expectedEnv;
}
