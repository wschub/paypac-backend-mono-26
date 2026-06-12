/**
 * Simulador del webhook de Wompi (transaction.updated) para Sandbox.
 *
 * Construye el payload según el método de pago, calcula la firma
 * (SHA256 de id + status + amount_in_cents + timestamp + secreto de eventos)
 * y lo envía al endpoint del webhook. Sin el cálculo de la firma el backend
 * responde 401 (Invalid signature), por eso NO sirve copiar/pegar un checksum
 * de otro ejemplo si cambias id, status o monto.
 *
 * Requiere en .env: TEST_EVENTS (sandbox) o PRV_EVENTS (producción).
 *
 * Uso:
 *   npx tsx src/tools/simulate-wompi-webhook.ts \
 *     --reference INV-1780520938473-8711 \
 *     --method NEQUI \
 *     --status APPROVED \
 *     --amount 30000000 \
 *     --url https://paypac-backend-mono-26-production.up.railway.app/api/webhooks/wompi
 *
 * Flags:
 *   --reference  num_invoice de una factura existente (obligatorio para que cree tickets)
 *   --method     CARD | NEQUI | PSE | BANCOLOMBIA_TRANSFER | BANCOLOMBIA_QR |
 *                BANCOLOMBIA_COLLECT | DAVIPLATA | BANCOLOMBIA_BNPL | PCOL   (default: CARD)
 *   --status     APPROVED | DECLINED | VOIDED | ERROR | PENDING              (default: APPROVED)
 *   --amount     monto en centavos (default: 30000000 = $300.000)
 *   --url        endpoint del webhook (default: Railway producción)
 *   --env        test | production (default: test → usa TEST_EVENTS)
 *   --email      customer_email (default: david.wschu@gmail.com)
 *   --dry        solo imprime el payload (con checksum válido) sin enviarlo — útil para Postman
 */
import 'dotenv/config';
import crypto from 'crypto';
import axios from 'axios';

// ── Parseo simple de argumentos ──────────────────────────────────────────
function arg(name: string, fallback?: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const value = process.argv[idx + 1];
  return value && !value.startsWith('--') ? value : 'true';
}

const reference  = arg('reference');
const method     = (arg('method', 'CARD') as string).toUpperCase();
const status     = (arg('status', 'APPROVED') as string).toUpperCase();
const amount     = parseInt(arg('amount', '30000000') as string, 10);
const url        = arg('url', 'https://paypac-backend-mono-26-production.up.railway.app/api/webhooks/wompi') as string;
const environment = arg('env', 'test') as string;
const email      = arg('email', 'david.wschu@gmail.com') as string;
const dryRun     = arg('dry') === 'true';

if (!reference) {
  console.error('❌ Falta --reference (num_invoice de una factura existente en la BD)');
  process.exit(1);
}

const VALID_STATUSES = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR', 'PENDING'];
if (!VALID_STATUSES.includes(status)) {
  console.error(`❌ Status inválido: ${status}. Permitidos: ${VALID_STATUSES.join(', ')}`);
  process.exit(1);
}

// ── payment_method según el método (replica lo que envía Wompi) ─────────
const PAYMENT_METHODS: Record<string, any> = {
  CARD: {
    type: 'CARD',
    installments: 1,
    extra: { brand: 'VISA', last_four: '4242', name: 'VISA-4242', processor_response_code: '00' },
  },
  NEQUI: {
    type: 'NEQUI',
    phone_number: '3991111111',
    extra: { transaction_id: 'TEST-NEQUI-001' },
  },
  PSE: {
    type: 'PSE',
    user_type: 0,
    user_legal_id_type: 'CC',
    user_legal_id: '1017165219',
    financial_institution_code: '1',
    payment_description: 'Boletas PayPac',
    extra: { async_payment_url: 'https://sandbox.wompi.co/v1/pse/redirect/test', return_code: 'OK' },
  },
  BANCOLOMBIA_TRANSFER: {
    type: 'BANCOLOMBIA_TRANSFER',
    user_type: 'PERSON',
    payment_description: 'Boletas PayPac',
    extra: { async_payment_url: 'https://sandbox.wompi.co/v1/bancolombia/redirect/test', is_three_ds: false },
  },
  BANCOLOMBIA_QR: {
    type: 'BANCOLOMBIA_QR',
    payment_description: 'Boletas PayPac',
    extra: { qr_id: 'a3827b90-501b-11ed-ae9b-3156df51ed75', qr_image: 'PD94bWwgdmVyc2lvbj0iTEST', external_identifier: 'd00000000000' },
  },
  BANCOLOMBIA_COLLECT: {
    type: 'BANCOLOMBIA_COLLECT',
    extra: { business_agreement_code: '12345', payment_intention_identifier: '65770204276' },
  },
  DAVIPLATA: {
    type: 'DAVIPLATA',
    user_legal_id: '1017165219',
    user_legal_id_type: 'CC',
    payment_description: 'Boletas PayPac',
    extra: { external_identifier: '452341', daviplata_transaction_id: '452341', is_three_ds: false },
  },
  BANCOLOMBIA_BNPL: {
    type: 'BANCOLOMBIA_BNPL',
    name: 'Juan',
    last_name: 'Rodriguez',
    phone_code: '+57',
    phone_number: '3013732491',
    user_legal_id: '1017165219',
    user_legal_id_type: 'CC',
    payment_description: 'Boletas PayPac',
    extra: { url: 'https://sandbox.wompi.co/v1/bnpl/redirect/test', is_three_ds: false },
  },
  PCOL: {
    type: 'PCOL',
    extra: {
      async_payment_url: 'https://sandbox.wompi.co/v1/pcol/redirect/test',
      points_redeemed: 1000,
      remaining_amount_in_cents: 0,
      redeemed_amount_in_cents_pcol: amount,
    },
  },
};

const paymentMethod = PAYMENT_METHODS[method];
if (!paymentMethod) {
  console.error(`❌ Método inválido: ${method}. Permitidos: ${Object.keys(PAYMENT_METHODS).join(', ')}`);
  process.exit(1);
}

// ── Firma: SHA256(id + status + amount_in_cents + timestamp + secreto) ──
const secret = environment === 'test' ? process.env.TEST_EVENTS : process.env.PRV_EVENTS;
if (!secret) {
  console.error(`❌ Falta ${environment === 'test' ? 'TEST_EVENTS' : 'PRV_EVENTS'} en el .env`);
  process.exit(1);
}

const transactionId = `TEST-${method}-${Date.now()}`;
const timestamp     = Math.floor(Date.now() / 1000);

const checksum = crypto
  .createHash('sha256')
  .update(`${transactionId}${status}${amount}${timestamp}${secret}`)
  .digest('hex')
  .toUpperCase();

// ── Payload completo ─────────────────────────────────────────────────────
const payload = {
  event: 'transaction.updated',
  data: {
    transaction: {
      id: transactionId,
      reference,
      status,
      amount_in_cents: amount,
      currency: 'COP',
      customer_email: email,
      payment_method_type: method,
      payment_method: paymentMethod,
      customer_data: {
        phone_number: '+573013732491',
        full_name: 'Juan Rodriguez',
        legal_id: '1017165219',
        legal_id_type: 'CC',
      },
      finalized_at: status === 'PENDING' ? null : new Date().toISOString(),
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  },
  environment,
  signature: {
    properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
    checksum,
  },
  timestamp,
  sent_at: new Date().toISOString(),
};

// ── Enviar ───────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔔 Simulando webhook → ${method} / ${status} / ${amount} centavos`);
  console.log(`   Reference: ${reference}`);
  console.log(`   Endpoint:  ${url}`);
  console.log(`   Checksum:  ${checksum}\n`);

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    console.log('\nℹ️  --dry: payload impreso, no enviado (cópialo a Postman tal cual).');
    return;
  }

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json', 'X-Event-Checksum': checksum },
    validateStatus: () => true,
  });

  console.log(`📨 Respuesta HTTP ${response.status}:`);
  console.log(JSON.stringify(response.data, null, 2));

  if (response.status === 401) {
    console.error('\n❌ Firma rechazada: revisa que TEST_EVENTS local sea el MISMO secreto configurado en el servidor.');
  } else if (response.status === 400) {
    console.error('\n❌ Ambiente rechazado: el servidor espera otro environment (revisa WOMPI_MODE del servidor).');
  }
}

main().catch((e) => {
  console.error('❌ Error enviando webhook:', e.message);
  process.exit(1);
});
