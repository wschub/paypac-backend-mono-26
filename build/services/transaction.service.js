"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_repository_1 = require("../repositories/transaction.repository");
const invoice_repository_1 = require("../repositories/invoice.repository");
const invoicetickets_repository_1 = require("../repositories/invoicetickets.repository");
const event_repository_1 = require("../repositories/event.repository");
const eventstages_repository_1 = require("../repositories/eventstages.repository");
const user_repository_1 = require("../repositories/user.repository");
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const ConfigManager_1 = require("../utils/ConfigManager");
const utils_1 = require("../utils/utils");
const payment_method_factory_1 = require("./payment-methods/payment-method.factory");
const transactionRepo = new transaction_repository_1.TransactionRepository();
const invoiceRepo = new invoice_repository_1.InvoiceRepository();
const invoiceTicketsRepo = new invoicetickets_repository_1.InvoiceTicketsRepository();
const eventRepo = new event_repository_1.EventRepository();
const stagesRepo = new eventstages_repository_1.EventStagesRepository();
const userRepo = new user_repository_1.UserRepository();
/** Polling del recurso asíncrono (async_payment_url, QR, OTP) en Wompi */
const ASYNC_POLL_MAX_ATTEMPTS = 8;
const ASYNC_POLL_INTERVAL_MS = 1500;
class TransactionService {
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
    processTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // ── 0. Resolver el payload del método de pago (compatibilidad CARD legacy) ──
            const methodPayload = ((_a = data.payment_method) === null || _a === void 0 ? void 0 : _a.type)
                ? data.payment_method
                : {
                    type: data.paymentMethodType || 'CARD',
                    token: data.token_card_user,
                    installments: data.installments_user,
                };
            // ── 1. Validar que el método esté soportado y activo en PaymentMethodsUI ──
            if (!payment_method_factory_1.PaymentMethodFactory.isSupported(methodPayload.type)) {
                throw new Error(`Método de pago no soportado: ${methodPayload.type}`);
            }
            const uiMethod = yield db_1.prisma.paymentMethodsUI.findFirst({
                where: { method_code: methodPayload.type.toUpperCase() },
            });
            if (!uiMethod || uiMethod.method_status !== 1) {
                throw new Error(`El método de pago ${methodPayload.type} no está disponible actualmente`);
            }
            const method = payment_method_factory_1.PaymentMethodFactory.create(methodPayload.type);
            // ── 2. Lock del usuario + crear/cargar factura (transacción de BD corta,
            //       sin llamadas HTTP adentro) ──
            const { user, invoice } = yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const user = yield tx.user.findUnique({
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
                if (!user)
                    throw new Error('Usuario no encontrado');
                if (user.status === 99) {
                    throw new Error('Ya hay un pago en proceso para este usuario');
                }
                // Bloquear usuario mientras procesa (evitar double-spending)
                yield tx.user.update({
                    where: { id: data.user_id },
                    data: { status: 99 },
                });
                let invoice;
                if (data.invoice_id) {
                    // Flujo recomendado: factura ya creada en POST /api/invoices
                    const existing = yield tx.invoice.findUnique({ where: { id: data.invoice_id } });
                    if (!existing)
                        throw new Error('Factura no encontrada');
                    if (existing.user_id !== data.user_id) {
                        throw new Error('La factura no pertenece a este usuario');
                    }
                    if (existing.status !== client_1.InvoiceStatus.ISSUED) {
                        throw new Error(`La factura no está disponible para pago (status: ${existing.status})`);
                    }
                    // Registrar método y canal reales en la factura
                    invoice = yield tx.invoice.update({
                        where: { id: existing.id },
                        data: Object.assign({ payment_method: methodPayload.type.toUpperCase() }, (data.sale_channel ? { sale_channel: data.sale_channel } : {})),
                    });
                }
                else {
                    // Flujo legacy: crear Invoice + InvoiceTickets aquí
                    // (el validador exige event_id, amount_in_cents y shoppingCart en este modo)
                    const numInvoice = yield (0, utils_1.createNumInvoice)();
                    const shoppingCart = (_a = data.shoppingCart) !== null && _a !== void 0 ? _a : [];
                    const amountInCents = (_b = data.amount_in_cents) !== null && _b !== void 0 ? _b : 0;
                    invoice = yield tx.invoice.create({
                        data: Object.assign({ user_id: data.user_id, user_uid: user.firebase_uid || '', num_invoice: numInvoice, user_name: user.name, user_lastname: user.last_name, user_num_doc: data.user_num_doc, user_type_doc: data.user_type_doc, num_items: shoppingCart.length, event_id: data.event_id, apply_discount: data.apply_discount, discount_type: 0, discount_value: 0, total_ticket_dcto: 0, total_ticket_regular: amountInCents / 100, total: amountInCents / 100, status: client_1.InvoiceStatus.ISSUED, payment_method: methodPayload.type.toUpperCase() }, (data.sale_channel ? { sale_channel: data.sale_channel } : {})),
                    });
                    yield tx.invoiceTickets.createMany({
                        data: shoppingCart.map((item) => ({
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
            }));
            // El monto a cobrar siempre sale de la factura (no del front)
            const amount_in_cents = data.invoice_id
                ? Math.round(invoice.total * 100)
                : data.amount_in_cents;
            try {
                // ── 3. Preparar contexto y ejecutar el pago en Wompi (fuera de la tx de BD) ──
                const currency = 'COP';
                const expiration_time = yield (0, utils_1.getExpirationTime)();
                const customer_email = user.email;
                const customer_data = {
                    phone_number: user.phone_number,
                    full_name: `${user.name} ${user.last_name}`,
                    legal_id: data.user_num_doc || user.num_doc || '',
                    legal_id_type: (data.user_type_doc || user.type_doc || 'CC'),
                };
                const redirect_url = data.redirect_url ||
                    process.env.WOMPI_REDIRECT_URL ||
                    'https://tu-dominio.com/pago/resultado';
                const paymentResult = yield this.sendTransaction(method, methodPayload, {
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
                // ── 3b. Actualizar PaymentMethodCard con el payment_source_id permanente ──
                // El tok_... es de un solo uso; lo reemplazamos con el ID de la fuente de
                // pago de Wompi (permanente) para que futuros reintentos no fallen.
                if (methodPayload.type === 'CARD' &&
                    paymentResult.payment_source_id &&
                    ((_b = methodPayload.token) === null || _b === void 0 ? void 0 : _b.startsWith('tok_'))) {
                    try {
                        const updated = yield db_1.prisma.paymentMethodCard.updateMany({
                            where: { id_token: methodPayload.token },
                            data: { id_token: String(paymentResult.payment_source_id) },
                        });
                        if (updated.count > 0) {
                            console.log(`✅ PaymentMethodCard actualizado con payment_source_id: ${paymentResult.payment_source_id}`);
                        }
                    }
                    catch (e) {
                        console.warn('⚠️ No se pudo actualizar PaymentMethodCard:', e.message);
                    }
                }
                // ── 4. Crear registro en Transactions y desbloquear usuario ──
                const transaction = yield db_1.prisma.transactions.create({
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
                        payment_method: (_c = paymentResult.wompi_payment_method) !== null && _c !== void 0 ? _c : {
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
                            next_action: paymentResult.next_action,
                        },
                    },
                });
                yield db_1.prisma.user.update({
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
            }
            catch (error) {
                yield db_1.prisma.user.update({
                    where: { id: data.user_id },
                    data: { status: 1 },
                });
                throw error;
            }
        });
    }
    /**
     * Enviar transacción a Wompi usando la clase polimórfica del método de pago.
     */
    sendTransaction(method, payload, params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                const wompiUrl = ConfigManager_1.configManager.getWompiUrl();
                const tokenAcceptance = ConfigManager_1.configManager.getWompiTokenAcceptance();
                const cleanTokenAcceptance = (0, utils_1.cleanString)(tokenAcceptance);
                const urlMerchants = `${wompiUrl}/${cleanTokenAcceptance}`;
                const prvCertificate = (0, utils_1.cleanString)(ConfigManager_1.configManager.paymentSources());
                const merchantsResponse = yield axios_1.default.get(urlMerchants);
                const merchantData = merchantsResponse.data.data;
                // Tokens de aceptación Wompi (Habeas Data): política de privacidad +
                // autorización de tratamiento de datos personales. El usuario debe haber
                // aceptado ambos contratos en la UI (checkboxes) antes de llegar aquí.
                const acceptanceToken = (_a = merchantData.presigned_acceptance) === null || _a === void 0 ? void 0 : _a.acceptance_token;
                const personalAuthToken = (_b = merchantData.presigned_personal_data_auth) === null || _b === void 0 ? void 0 : _b.acceptance_token;
                const wompiCtx = {
                    wompiUrl,
                    acceptanceToken,
                    personalAuthToken,
                    headers: {
                        Authorization: `Bearer ${prvCertificate}`,
                        'Content-Type': 'application/json',
                    },
                };
                const paymentCtx = {
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
                const extraFields = yield method.prepare(wompiCtx, payload, paymentCtx);
                // Persistir payment_source_id inmediatamente: el tok_ queda consumido en
                // Wompi tras prepare(), incluso si la transacción falla después.
                if (payload.type === 'CARD' &&
                    ((_c = payload.token) === null || _c === void 0 ? void 0 : _c.startsWith('tok_')) &&
                    extraFields.payment_source_id) {
                    try {
                        const r = yield db_1.prisma.paymentMethodCard.updateMany({
                            where: { id_token: payload.token },
                            data: { id_token: String(extraFields.payment_source_id) },
                        });
                        if (r.count > 0) {
                            console.log(`✅ [CARD] PaymentMethodCard.id_token → ${extraFields.payment_source_id}`);
                        }
                    }
                    catch (e) {
                        console.warn('⚠️ [CARD] No se pudo persistir payment_source_id:', e.message);
                    }
                }
                // 3. Firma de integridad
                const signature = yield ConfigManager_1.configManager.getSignature(params.reference, params.amount_in_cents, params.currency, params.expiration_time);
                // 4. Crear la transacción
                const paymentMethodBody = method.buildPaymentMethod(payload);
                const transactionData = Object.assign(Object.assign(Object.assign({ acceptance_token: acceptanceToken }, (personalAuthToken ? { accept_personal_auth: personalAuthToken } : {})), { amount_in_cents: params.amount_in_cents, currency: params.currency, signature, customer_email: params.customer_email, redirect_url: params.redirect_url, reference: params.reference, expiration_time: params.expiration_time, customer_data: params.customer_data }), extraFields);
                if (paymentMethodBody)
                    transactionData.payment_method = paymentMethodBody;
                // Segunda transacción PCOL (pago del saldo con otro método)
                if (payload.parent_transaction_id) {
                    transactionData.parent_transaction_id = payload.parent_transaction_id;
                }
                const transactionResponse = yield axios_1.default.post(`${wompiUrl}/transactions`, transactionData, { headers: wompiCtx.headers });
                let wompiTransaction = transactionResponse.data.data;
                console.log('✅ Transacción creada en Wompi:', wompiTransaction.id);
                // 5. Polling del recurso asíncrono si el método lo requiere
                //    (async_payment_url, qr_image, url OTP, códigos de convenio)
                if (method.needsAsyncResource && !method.hasAsyncResource(wompiTransaction)) {
                    wompiTransaction = yield this.pollAsyncResource(wompiCtx, wompiTransaction.id, method);
                }
                return {
                    status: 'success',
                    payment_source_id: extraFields.payment_source_id,
                    wompi_transaction_id: wompiTransaction.id,
                    wompi_payment_method: wompiTransaction.payment_method,
                    next_action: method.extractNextAction(wompiTransaction),
                    reference: params.reference,
                    message: 'Transacción iniciada exitosamente',
                };
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    console.error('❌ Wompi Error:', JSON.stringify((_d = error.response) === null || _d === void 0 ? void 0 : _d.data));
                    return {
                        status: 'failed',
                        message: ((_g = (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.reason) ||
                            JSON.stringify((_k = (_j = (_h = error.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.messages) ||
                            'Error desconocido de Wompi',
                    };
                }
                console.error('❌ Error procesando pago:', error.message);
                return { status: 'failed', message: error.message || 'Error al procesar el pago' };
            }
        });
    }
    /**
     * Long polling a GET /transactions/:id hasta que aparezca el recurso
     * asíncrono que el front necesita (URL de pago, QR, OTP, convenio).
     */
    pollAsyncResource(wompiCtx, wompiTransactionId, method) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastTransaction = null;
            for (let attempt = 1; attempt <= ASYNC_POLL_MAX_ATTEMPTS; attempt++) {
                yield new Promise((r) => setTimeout(r, ASYNC_POLL_INTERVAL_MS));
                const response = yield axios_1.default.get(`${wompiCtx.wompiUrl}/transactions/${wompiTransactionId}`, { headers: wompiCtx.headers });
                lastTransaction = response.data.data;
                if (method.hasAsyncResource(lastTransaction)) {
                    console.log(`✅ [${method.code}] Recurso async disponible (intento ${attempt})`);
                    return lastTransaction;
                }
            }
            console.warn(`⚠️ [${method.code}] Recurso async no disponible tras ${ASYNC_POLL_MAX_ATTEMPTS} intentos. ` +
                'El front deberá consultar el estado de la transacción.');
            return lastTransaction;
        });
    }
    /**
     * Obtener transacciones de un usuario
     */
    getUserTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return transactionRepo.findByUserId(userId);
        });
    }
    /**
     * Obtener transacción por ID
     * Verifica que el usuario sea el dueño o sea PAYPAC
     */
    getTransactionById(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield transactionRepo.findById(id);
            if (!transaction)
                throw new Error('Transacción no encontrada');
            const isOwner = transaction.user_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permisos para ver esta transacción');
            return transaction;
        });
    }
    /**
     * Obtener transacción por reference (num_invoice)
     * Solo PAYPAC
     */
    getTransactionByReference(reference, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede buscar por referencia');
            const transaction = yield transactionRepo.findByReference(reference);
            if (!transaction)
                throw new Error(`Transacción con referencia "${reference}" no encontrada`);
            return transaction;
        });
    }
    /**
     * Obtener todas las transacciones
     * solo PAYPAC
     */
    getAllTransactions(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver todas las transacciones');
            return transactionRepo.findAll();
        });
    }
    /**
     * Obtener transacción por invoice_id
     * Solo PAYPAC
     */
    getTransactionByInvoiceId(invoiceId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede buscar por invoice');
            const transaction = yield transactionRepo.findByInvoiceId(invoiceId);
            if (!transaction)
                throw new Error(`Transacción con invoice "${invoiceId}" no encontrada`);
            return transaction;
        });
    }
    /**
     * Obtener todas las transacciones por status
     * Solo PAYPAC — vista administrativa
     */
    getTransactionsByStatus(status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede filtrar por status');
            const validStatuses = ['APPROVED', 'PENDING', 'DECLINED', 'VOIDED', 'ERROR'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Status inválido. Valores permitidos: ${validStatuses.join(', ')}`);
            }
            return transactionRepo.findByStatus(status);
        });
    }
}
exports.TransactionService = TransactionService;
