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
const userRepository = new user_repository_1.UserRepository();
const emailService = new notificationmessagequeue_service_1.NotificationMessageQueueService();
class AuthService {
    /**
     * Registrar usuario
     * Funciona para:
     * - Auto-registro de CUSTOMER (público)
     * - Creación de usuarios por PAYPAC/ORGANIZER (protegido)
     */
    register(data, createdBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let firebaseUid = null;
            try {
                // 1. ✅ Verificar que el email no exista en PostgreSQL
                const existing = yield userRepository.findByEmail(data.email);
                if (existing) {
                    throw new Error('Email already in use');
                }
                // 2. ✅ Validar reglas de negocio según quien crea el usuario
                if (createdBy) {
                    // Usuario creado por admin (PAYPAC/ORGANIZER)
                    console.log(`👤 Usuario creado por: ${createdBy.userRole} (ID: ${createdBy.userId})`);
                    // PAYPAC puede crear cualquier rol
                    // ORGANIZER solo puede crear STAFF, STAFF_PROMOTER, PROMOTER 
                    if (createdBy.userRole === 'ORGANIZER') {
                        const allowedRoles = [client_1.ROLES.STAFF, client_1.ROLES.STAFF_PROMOTER, client_1.ROLES.PROMOTER, client_1.ROLES.CUSTOMER];
                        if (!allowedRoles.includes(data.role)) {
                            throw new Error('ORGANIZER solo puede crear usuarios con roles: STAFF, STAFF_PROMOTER, PROMOTER, CUSTOMER');
                        }
                    }
                }
                else {
                    // Auto-registro (debe ser CUSTOMER)
                    if (data.role !== client_1.ROLES.CUSTOMER) {
                        throw new Error('El auto-registro solo permite el rol CUSTOMER');
                    }
                    console.log('👤 Auto-registro de CUSTOMER');
                }
                const fullphoneNumber = `+57${data.phone_number}`;
                // 3. ✅ Crear usuario en Firebase Auth
                const firebaseUser = yield firebase_1.firebaseAuth.createUser({
                    email: data.email,
                    password: data.password,
                    displayName: `${data.name} ${data.last_name}`,
                    phoneNumber: fullphoneNumber,
                    emailVerified: false,
                });
                firebaseUid = firebaseUser.uid;
                console.log('✅ Usuario creado en Firebase:', firebaseUid);
                // 4. ✅ Guardar en PostgreSQL
                const user = yield userRepository.create({
                    name: data.name,
                    last_name: data.last_name,
                    email: data.email,
                    password: 'firebase_managed',
                    phone_number: fullphoneNumber,
                    role: data.role,
                    company_id: data.company_id || null,
                    firebase_uid: firebaseUid,
                    auth_method: 'firebase',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log('✅ Usuario creado en PostgreSQL:', user.id);
                // 5. ✅ Establecer Custom Claims en Firebase
                yield firebase_1.firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
                    userId: user.id,
                    companyId: user.company_id,
                    role: user.role,
                });
                console.log('✅ Custom claims establecidos');
                // 6. ✅ Generar Custom Token
                const customToken = yield firebase_1.firebaseAuth.createCustomToken(firebaseUser.uid, {
                    userId: user.id,
                    companyId: user.company_id,
                    role: user.role,
                });
                // 7. 📧 PUNTO DE INTEGRACIÓN PARA EMAIL
                console.log('📧 ===== ENVIAR EMAIL DE CONFIRMACIÓN AQUÍ =====');
                console.log('📧 Datos para el email:', {
                    to: user.email,
                    name: user.name,
                    role: user.role,
                    isAutoRegister: !createdBy,
                    createdByAdmin: createdBy ? `${createdBy.userRole} (ID: ${createdBy.userId})` : null,
                });
                // 7. 📧 Enviar email según rol y origen del registro
                if (!createdBy) {
                    // ── Auto-registro CUSTOMER ──────────────────────────
                    try {
                        const otpTemp = Math.floor(100000 + Math.random() * 900000).toString();
                        yield emailService.queueEmail({
                            userId: user.id,
                            email: user.email,
                            templateCode: 'REGISTRATION_VERIFY_MAIL',
                            variables: {
                                user_name: `${user.name} ${user.last_name}`,
                                otp_code: otpTemp,
                                verify_link: 'https://paypac.co/verify-account',
                            },
                        });
                        console.log('📧 Email de verificación encolado para:', user.email);
                    }
                    catch (emailError) {
                        console.error('⚠️ No se pudo encolar el email de verificación:', emailError.message);
                    }
                }
                else {
                    // ── Creado por admin (ORGANIZER, STAFF, STAFF_PROMOTER, PAYPAC) ──
                    try {
                        yield emailService.queueEmail({
                            userId: user.id,
                            email: user.email,
                            templateCode: 'REGISTRATION_ACCEPT',
                            variables: {
                                name: user.name,
                                last_name: user.last_name,
                                inviter_name: 'PayPac', // TODO: traer nombre real del createdBy.userId si se requiere
                                inviter_last_name: 'Admin',
                                role: user.role,
                                email: user.email,
                                accept_link: 'https://paypac.co/login',
                            },
                        });
                        console.log('📧 Email de invitación encolado para:', user.email);
                    }
                    catch (emailError) {
                        console.error('⚠️ No se pudo encolar el email de invitación:', emailError.message);
                    }
                }
                console.log('📧 ============================================');
                // TODO: Aquí irá la integración con el servicio de email
                // await emailService.sendWelcomeEmail(user.email, user.name);
                // 8. 🎫 Buscar transferencias pendientes (solo CUSTOMER auto-registrado)
                if (!createdBy && data.role === client_1.ROLES.CUSTOMER) {
                    try {
                        const { TicketTransactionService } = yield Promise.resolve().then(() => __importStar(require('./tickettransaction.service')));
                        const ticketTxService = new TicketTransactionService();
                        // Buscar por email y por celular
                        const byEmail = yield ticketTxService.acceptByContact(user.id, user.email);
                        const byPhone = yield ticketTxService.acceptByContact(user.id, user.phone_number);
                        const totalUpdated = ((_a = byEmail.updated) !== null && _a !== void 0 ? _a : 0) + ((_b = byPhone.updated) !== null && _b !== void 0 ? _b : 0);
                        if (totalUpdated > 0) {
                            console.log(`🎫 ${totalUpdated} transferencia(s) pendiente(s) asignadas al nuevo usuario ${user.id}`);
                        }
                    }
                    catch (transferError) {
                        console.error('⚠️ Error buscando transferencias pendientes:', transferError.message);
                    }
                }
                // 9. ✅ Retornar datos del usuario
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
                // Rollback: Si falla PostgreSQL y el usuario fue creado en Firebase, eliminarlo
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
/**
  * ❌ generateToken - YA NO SE USA
  * Firebase genera los tokens automáticamente
  * Puedes eliminar este método
  */
// private generateToken(user: any) { ... }
