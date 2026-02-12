import crypto from 'crypto';
import { WompiWebhookEvent } from '../types/wompi.types';

/**
 * Verificar firma del webhook de Wompi
 * Documentación: https://docs.wompi.co/docs/eventos-1#verificaci%C3%B3n-de-firma
 */
export function verifyWompiSignature(payload: WompiWebhookEvent): boolean {
  try {
    console.log('🔐 VERIFICANDO FIRMA DEL WEBHOOK');
    console.log('-'.repeat(80));

    const { event, data, timestamp, signature, environment } = payload;

    // 1. Obtener el secret según el ambiente
    // ✅ CORREGIDO: Usar "production" en lugar de "prod"
    const webhookSecret = environment === 'test' 
      ? process.env.TEST_EVENTS 
      : process.env.PRV_EVENTS;

    console.log('📋 Configuración:');
    console.log('   Environment:', environment);
    console.log('   Secret usado:', environment === 'test' ? 'TEST_EVENTS' : 'PRV_EVENTS');
    console.log('   Secret configurado:', webhookSecret ? '✅ Sí' : '❌ No');

    if (!webhookSecret) {
      console.error('❌ SECRET NO CONFIGURADO EN .ENV');
      console.error('   Variable faltante:', environment === 'test' ? 'TEST_EVENTS' : 'PRV_EVENTS');
      return false;
    }

    console.log('   Timestamp recibido:', timestamp);
    console.log('   Event type:', event);
    console.log('   Signature properties:', signature.properties);
    console.log('   Checksum recibido:', signature.checksum);
    console.log();

    // 2. Extraer valores de las propiedades especificadas
    console.log('📊 Extrayendo valores de properties...');
    const propertyValues = signature.properties.map((prop, index) => {
      const value = getNestedProperty(data, prop);
      console.log(`   [${index}] ${prop} = ${value}`);
      return value;
    });
    console.log();

    // 3. Concatenar valores de properties
    const propertiesString = propertyValues.join('');
    console.log('🔗 String de properties concatenado:');
    console.log('   "' + propertiesString + '"');
    console.log();

    // 4. Concatenar timestamp
    const stringWithTimestamp = propertiesString + timestamp.toString();
    console.log('🔗 String con timestamp:');
    console.log('   "' + stringWithTimestamp + '"');
    console.log();

    // 5. Concatenar secret
    const stringToSign = stringWithTimestamp + webhookSecret;
    console.log('🔗 String final a firmar (CON SECRET):');
    console.log('   "' + stringToSign + '"');
    console.log();

    // 6. Generar checksum con SHA256
    console.log('🔐 Generando checksum SHA256...');
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(stringToSign)
      .digest('hex')
      .toUpperCase();

    const receivedChecksum = signature.checksum.toUpperCase();

    console.log('📋 Comparación de checksums:');
    console.log('   Esperado: ', expectedChecksum);
    console.log('   Recibido: ', receivedChecksum);
    console.log('   Coinciden:', expectedChecksum === receivedChecksum ? '✅ SÍ' : '❌ NO');
    console.log('-'.repeat(80) + '\n');

    // 7. Comparar checksums
    const isValid = expectedChecksum === receivedChecksum;

    if (!isValid) {
      console.error('❌ FIRMA INVÁLIDA - POSIBLES CAUSAS:');
      console.error('   1. Secret incorrecto en .env');
      console.error('   2. Ambiente incorrecto (test vs production)');
      console.error('   3. Timestamp alterado');
      console.error('   4. Data alterada');
      console.error('   5. Man-in-the-middle attack\n');
    }

    return isValid;
  } catch (error: any) {
    console.error('❌ ERROR AL VERIFICAR FIRMA:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
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
      console.warn(`   ⚠️ Propiedad no encontrada: ${path}`);
      return '';
    }
  }

  return value !== null && value !== undefined ? value : '';
}

/**
 * Validar que el ambiente del webhook coincida con la configuración
 * ✅ CORREGIDO: Usar "production" en lugar de "prod"
 */
export function validateWebhookEnvironment(environment: string): boolean {
  const expectedEnv = process.env.WOMPI_MODE === 'sandbox' ? 'test' : 'production';
  const isValid = environment === expectedEnv;

  console.log('🌍 Validación de ambiente:');
  console.log('   WOMPI_MODE configurado:', process.env.WOMPI_MODE);
  console.log('   Ambiente esperado:', expectedEnv);
  console.log('   Ambiente recibido:', environment);
  console.log('   ¿Válido?:', isValid ? '✅ SÍ' : '❌ NO');

  if (!isValid) {
    console.error('');
    console.error('❌ AMBIENTE INVÁLIDO:');
    console.error('   Esperado:', expectedEnv);
    console.error('   Recibido:', environment);
    console.error('   WOMPI_MODE actual:', process.env.WOMPI_MODE);
    console.error('');
    console.error('💡 SOLUCIÓN:');
    if (process.env.WOMPI_MODE === 'prod') {
      console.error('   ⚠️ Cambiar WOMPI_MODE="prod" a WOMPI_MODE="production"');
    } else if (environment === 'test' && process.env.WOMPI_MODE === 'production') {
      console.error('   ⚠️ Estás enviando transacciones de prueba desde frontend');
      console.error('   📱 Usar PUB_PRO en lugar de PUB_TEST en el cliente');
    } else if (environment === 'production' && process.env.WOMPI_MODE === 'sandbox') {
      console.error('   ⚠️ Estás enviando transacciones REALES desde frontend');
      console.error('   📱 Cambiar WOMPI_MODE a "production" o usar PUB_TEST en cliente');
    }
    console.error('');
  }

  return isValid;
}

/**
 * Obtener URL base de Wompi según el modo configurado
 */
export function getWompiBaseUrl(): string {
  return process.env.WOMPI_MODE === 'sandbox'
    ? process.env.WOMPI_URL_SANDBOX || 'https://sandbox.wompi.co/v1'
    : process.env.WOMPI_URL_PRODUCTION || 'https://production.wompi.co/v1';
}

/**
 * Obtener llave pública según el modo
 */
export function getWompiPublicKey(): string {
  return process.env.WOMPI_MODE === 'sandbox'
    ? process.env.PUB_TEST || ''
    : process.env.PUB_PRO || '';
}

/**
 * Obtener llave privada según el modo
 */
export function getWompiPrivateKey(): string {
  return process.env.WOMPI_MODE === 'sandbox'
    ? process.env.PRV_TEST || ''
    : process.env.PRV_PRO || '';
}

/**
 * Obtener secret de integridad según el modo
 */
export function getWompiIntegritySecret(): string {
  return process.env.WOMPI_MODE === 'sandbox'
    ? process.env.TEST_INTEGRITY || ''
    : process.env.PRV_INTEGRITY || '';
}