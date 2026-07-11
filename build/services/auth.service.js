"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const firebase_1 = require("../config/firebase");
const client_1 = require("@prisma/client");
const notificationmessagequeue_service_1 = require("./notificationmessagequeue.service");
const client_2 = require("../prisma/client");
const userRepository = new user_repository_1.UserRepository();
const emailService = new notificationmessagequeue_service_1.NotificationMessageQueueService();
class AuthService {
    /**
     * Registrar usuario
     * Funciona para:
     * - Auto-registro de CUSTOMER (público)
     * - Creación de usuarios por PAYPAC/ORGANIZER (protegido)
     *
     * ✅ OPTIMIZACIONES APLICADAS:
     * 1. Promise.all para setCustomUserClaims + createCustomToken
     * 2. Fire-and-forget para queueEmail (no bloquea respuesta)
     * 3. Fire-and-forget para acceptByContact (no bloquea respuesta)
     * 4. Se eliminó dynamic import repetido — se importa al inicio si es necesario
     */
    register(data, createdBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let firebaseUid = null;
            try {
                const isSocial = !!data.social_token;
                let resolvedEmail = (_a = data.email) !== null && _a !== void 0 ? _a : '';
                if (isSocial) {
                    // ── Registro social (Google/Apple): Firebase user ya existe ──
                    // Verificar el ID token y extraer uid + email
                    const decoded = yield firebase_1.firebaseAuth.verifyIdToken(data.social_token);
                    firebaseUid = decoded.uid;
                    resolvedEmail = (_c = (_b = decoded.email) !== null && _b !== void 0 ? _b : data.email) !== null && _c !== void 0 ? _c : '';
                    // Asegurarse de que no haya ya un registro en la BD
                    const existingByUid = yield userRepository.findByFirebaseUid(firebaseUid);
                    if (existingByUid)
                        throw new Error('Este usuario ya está registrado');
                    console.log('🔗 Registro social verificado — Firebase UID:', firebaseUid);
                }
                else {
                    // ── Registro email/password ──
                    if (!data.email || !data.password)
                        throw new Error('Email y contraseña son requeridos');
                    // 1. Verificar que el email no exista en PostgreSQL
                    const existing = yield userRepository.findByEmail(data.email);
                    if (existing)
                        throw new Error('Email already in use');
                    const fullphoneNumber = data.phone_number.startsWith('+')
                        ? data.phone_number
                        : `+57${data.phone_number}`;
                    // 3. Crear usuario en Firebase Auth
                    const firebaseUser = yield firebase_1.firebaseAuth.createUser({
                        email: data.email,
                        password: data.password,
                        displayName: `${data.name} ${data.last_name}`,
                        phoneNumber: fullphoneNumber,
                        emailVerified: false,
                    });
                    firebaseUid = firebaseUser.uid;
                    console.log('✅ Usuario creado en Firebase:', firebaseUid);
                }
                const fullphoneNumber = data.phone_number.startsWith('+')
                    ? data.phone_number
                    : `+57${data.phone_number}`;
                // 4. ✅ Guardar en PostgreSQL
                // Si se envía country_id y no lang_user, heredar language_default del país
                let resolvedLangUser = data.lang_user;
                if (!resolvedLangUser && data.country_id) {
                    const country = yield client_2.prisma.countries.findUnique({
                        where: { id: data.country_id },
                        select: { language_default: true },
                    });
                    if (country)
                        resolvedLangUser = country.language_default;
                }
                const now = new Date();
                const user = yield userRepository.create({
                    name: data.name,
                    last_name: data.last_name,
                    email: resolvedEmail,
                    password: 'firebase_managed',
                    phone_number: fullphoneNumber,
                    phone_number_verified_at: now, // teléfono ya validado por SMS OTP antes del registro
                    role: data.role,
                    company_id: data.company_id || null,
                    firebase_uid: firebaseUid,
                    auth_method: isSocial ? 'social' : 'firebase',
                    num_doc: data.num_doc,
                    type_doc: data.type_doc,
                    birth_date: data.birth_date,
                    lang_user: resolvedLangUser,
                    country_id: data.country_id,
                    gender: data.gender,
                    createdAt: now,
                    updatedAt: now,
                });
                console.log('✅ Usuario creado en PostgreSQL:', user.id);
                // 5. ✅ OPTIMIZACIÓN: Paralelizar Claims + Custom Token
                //    - setCustomUserClaims: round-trip a Google (~300-400ms)
                //    - createCustomToken: firma LOCAL con service account key (~5ms)
                //    - Son independientes entre sí → Promise.all
                const claimsPayload = {
                    userId: user.id,
                    companyId: user.company_id,
                    role: user.role,
                };
                const [, customToken] = yield Promise.all([
                    firebase_1.firebaseAuth.setCustomUserClaims(firebaseUid, claimsPayload),
                    firebase_1.firebaseAuth.createCustomToken(firebaseUid, claimsPayload),
                ]);
                console.log('✅ Custom claims + token generados en paralelo');
                // 6. ✅ OPTIMIZACIÓN: Fire-and-forget para email
                //    El usuario NO necesita esperar a que el email se encole
                //    para ver "Registro exitoso"
                this._sendRegistrationEmail(user, createdBy, data.source);
                // 7. ✅ OPTIMIZACIÓN: Fire-and-forget para transferencias pendientes
                //    Solo para CUSTOMER auto-registrado
                //    ⚠️ Flutter YA NO debe llamar accept-by-contact — solo el backend lo hace
                if (!createdBy && data.role === client_1.ROLES.CUSTOMER) {
                    this._acceptPendingTransfers(user.id, user.email, user.phone_number);
                }
                // 8. ✅ Retornar INMEDIATAMENTE — no esperar email ni transferencias
                return {
                    id: user.id,
                    name: user.name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role,
                    company_id: user.company_id,
                    uid: user.firebase_uid,
                    customToken: customToken,
                };
            }
            catch (error) {
                console.error('❌ Error en registro:', error.message);
                // Rollback: Si falla después de crear en Firebase, eliminarlo
                if (firebaseUid) {
                    try {
                        yield firebase_1.firebaseAuth.deleteUser(firebaseUid);
                        console.log('🔄 Rollback: Usuario eliminado de Firebase');
                    }
                    catch (rollbackError) {
                        if (rollbackError.code === 'auth/user-not-found') {
                            console.log('ℹ️ Usuario ya no existe en Firebase, rollback no necesario');
                        }
                        else {
                            console.error('❌ Error en rollback:', rollbackError.message);
                        }
                    }
                }
                throw new Error(error.message || 'Error al registrar usuario');
            }
        });
    }
    // ─── MÉTODOS PRIVADOS (fire-and-forget) ───────────────────────────
    /**
     * Enviar email de registro en background
     * ⚠️ NO retorna Promise al caller — fire-and-forget
     */
    _sendRegistrationEmail(user, createdBy, source) {
        const task = () => __awaiter(this, void 0, void 0, function* () {
            if (!createdBy) {
                // Generar y persistir OTP (válido 5 minutos)
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
                yield userRepository.update(user.id, {
                    email_verification_code: otp,
                    email_verification_expires_at: expiresAt,
                });
                if (source === 'web') {
                    const webUrl = process.env.WEB_URL || 'https://paypac.co';
                    yield emailService.queueEmail({
                        userId: user.id,
                        email: user.email,
                        templateCode: 'REGISTRATION_VERIFY_MAIL_WEB',
                        variables: {
                            user_name: `${user.name} ${user.last_name}`,
                            verify_link: `${webUrl}/verify-email?code=${otp}`,
                        },
                    });
                }
                else {
                    yield emailService.queueEmail({
                        userId: user.id,
                        email: user.email,
                        templateCode: 'REGISTRATION_VERIFY_MAIL_v1',
                        variables: {
                            user_name: `${user.name} ${user.last_name}`,
                            otp_code: otp,
                            verify_link: '',
                        },
                    });
                }
                console.log('📧 Email de verificación encolado para:', user.email);
            }
            else {
                // Creado por admin
                yield emailService.queueEmail({
                    userId: user.id,
                    email: user.email,
                    templateCode: 'REGISTRATION_ACCEPT',
                    variables: {
                        name: user.name,
                        last_name: user.last_name,
                        inviter_name: 'PayPac',
                        inviter_last_name: 'Admin',
                        role: user.role,
                        email: user.email,
                        accept_link: 'https://paypac.co/login',
                    },
                });
                console.log('📧 Email de invitación encolado para:', user.email);
            }
        });
        // Ejecutar sin await — errores se loguean pero no bloquean
        task().catch((err) => {
            console.error('⚠️ Error en email background:', err.message);
        });
    }
    /**
     * Aceptar transferencias pendientes en background
     * ⚠️ NO retorna Promise al caller — fire-and-forget
     * ⚠️ Flutter NO debe llamar accept-by-contact — esta es la ÚNICA ejecución
     */
    _acceptPendingTransfers(userId, email, phoneNumber) {
        const task = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { TicketTransactionService } = yield Promise.resolve().then(() => __importStar(require('./tickettransaction.service')));
            const ticketTxService = new TicketTransactionService();
            // Buscar por email Y por teléfono en paralelo
            const [byEmail, byPhone] = yield Promise.all([
                ticketTxService.acceptByContact(userId, email),
                ticketTxService.acceptByContact(userId, phoneNumber),
            ]);
            const totalUpdated = ((_a = byEmail.updated) !== null && _a !== void 0 ? _a : 0) + ((_b = byPhone.updated) !== null && _b !== void 0 ? _b : 0);
            if (totalUpdated > 0) {
                console.log(`🎫 ${totalUpdated} transferencia(s) asignadas al usuario ${userId}`);
            }
        });
        task().catch((err) => {
            console.error('⚠️ Error en accept transfers background:', err.message);
        });
    }
    /**
     * Reenviar código de verificación de email (app)
     */
    resendVerificationEmail(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findById(userId);
            if (!user)
                throw new Error('Usuario no encontrado');
            if (user.verified_user === 1)
                throw new Error('El email ya está verificado');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            yield userRepository.update(userId, {
                email_verification_code: otp,
                email_verification_expires_at: expiresAt,
            });
            yield emailService.queueEmail({
                userId: user.id,
                email: user.email,
                templateCode: 'REGISTRATION_VERIFY_MAIL_v1',
                variables: {
                    user_name: `${user.name} ${user.last_name}`,
                    otp_code: otp,
                    verify_link: '',
                },
            });
            return { sent: true };
        });
    }
    /**
     * Eliminar cuenta del usuario (requerido por Google Play Store)
     */
    deleteAccount(userId, firebaseUid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield userRepository.delete(userId);
            try {
                yield firebase_1.firebaseAuth.deleteUser(firebaseUid);
            }
            catch (err) {
                if (err.code !== 'auth/user-not-found') {
                    console.error('⚠️ Error eliminando usuario de Firebase:', err.message);
                }
            }
            return { deleted: true };
        });
    }
    /**
     * Verificar email con código OTP (app y web)
     */
    verifyEmailCode(userId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findById(userId);
            if (!user)
                throw new Error('Usuario no encontrado');
            if (user.verified_user === 1)
                throw new Error('El email ya está verificado');
            if (!user.email_verification_code || !user.email_verification_expires_at) {
                throw new Error('No hay un código de verificación pendiente');
            }
            if (user.email_verification_code !== code) {
                throw new Error('Código incorrecto');
            }
            if (new Date() > user.email_verification_expires_at) {
                throw new Error('El código ha expirado');
            }
            yield userRepository.update(userId, {
                email_verified_at: new Date(),
                verified_user: 1,
                email_verification_code: null,
                email_verification_expires_at: null,
            });
            return { verified: true };
        });
    }
    /**
     * Obtener todos los usuarios
     */
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield userRepository.findAll();
            return users;
        });
    }
}
exports.AuthService = AuthService;
