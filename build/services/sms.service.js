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
exports.SmsService = void 0;
const axios_1 = __importDefault(require("axios"));
const onurix_1 = require("../config/onurix");
const db_1 = require("../config/db");
class SmsService {
    /**
     * Enviar código 2FA por SMS
     * Valida que el teléfono NO esté registrado en la BD
     */
    sendCode2FA(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // 1. Validar que el teléfono NO esté registrado
                const existingUser = yield db_1.prisma.user.findFirst({
                    where: { phone_number: phone },
                });
                if (existingUser) {
                    return {
                        success: false,
                        message: 'Este número de teléfono ya está registrado',
                        phone,
                    };
                }
                // 2. Preparar datos para Onurix
                const data = {
                    client: onurix_1.onurixConfig.client,
                    key: onurix_1.onurixConfig.key,
                    phone: phone,
                    'app-name': onurix_1.onurixConfig.appName,
                };
                const headers = {
                    'content-type': 'application/x-www-form-urlencoded',
                };
                // 3. Enviar código a Onurix
                const response = yield axios_1.default.post(onurix_1.onurixConfig.sendUrl, data, { headers });
                console.log('✅ Código 2FA enviado:', {
                    phone,
                    response: response.data,
                });
                return {
                    success: true,
                    message: 'Código de verificación enviado exitosamente',
                    phone,
                };
            }
            catch (error) {
                console.error('❌ Error enviando código 2FA:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                return {
                    success: false,
                    message: 'Error al enviar código de verificación',
                    error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
                };
            }
        });
    }
    /**
     * Verificar código 2FA
     * Valida el código de 6 dígitos contra Onurix
     */
    verifyCode2FA(phone, code) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // 1. Preparar datos para Onurix
                const data = {
                    client: onurix_1.onurixConfig.client,
                    key: onurix_1.onurixConfig.key,
                    phone: phone,
                    'app-name': onurix_1.onurixConfig.appName,
                    code: code,
                };
                const headers = {
                    'content-type': 'application/x-www-form-urlencoded',
                };
                // 2. Verificar código con Onurix
                const response = yield axios_1.default.post(onurix_1.onurixConfig.verifyUrl, data, { headers });
                console.log('✅ Código 2FA verificado:', {
                    phone,
                    status: response.data.status,
                });
                // 3. Interpretar respuesta de Onurix
                const isVerified = response.data.verified === true || response.data.status === 1;
                if (isVerified) {
                    return {
                        success: true,
                        message: 'Código verificado exitosamente',
                        phone,
                        verified: true,
                    };
                }
                else {
                    return {
                        success: false,
                        message: 'Código inválido o expirado',
                        phone,
                        verified: false,
                    };
                }
            }
            catch (error) {
                console.error('❌ Error verificando código 2FA:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                return {
                    success: false,
                    message: 'Error al verificar código',
                    verified: false,
                    error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
                };
            }
        });
    }
    /**
     * Validar configuración de Onurix
     */
    validateConfig() {
        if (!onurix_1.onurixConfig.client || !onurix_1.onurixConfig.key) {
            throw new Error('Credenciales de Onurix no configuradas');
        }
    }
    /**
   * Verificar si un número de teléfono ya está registrado
   * Normaliza el número agregando +57 si no tiene código de país
   */
    checkPhoneExists(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            // Normalizar — agregar +57 si no tiene código de país
            const normalizedPhone = phone.startsWith('+') ? phone : `+57${phone}`;
            const existingUser = yield db_1.prisma.user.findFirst({
                where: { phone_number: normalizedPhone },
                select: { id: true },
            });
            return {
                exists: !!existingUser,
                phone: normalizedPhone,
            };
        });
    }
}
exports.SmsService = SmsService;
