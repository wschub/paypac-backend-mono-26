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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationFake = exports.checkPhoneExists = exports.verificationCode2FA = exports.registerCode2FA = void 0;
const sms_service_1 = require("../services/sms.service");
const smsService = new sms_service_1.SmsService();
/**
 * POST /api/sms/getcode2FA
 * Enviar código 2FA por SMS
 * Acceso: Público (no requiere autenticación)
 */
const registerCode2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        const result = yield smsService.sendCode2FA(phone);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    phone: result.phone,
                },
            });
        }
        else {
            // Si el teléfono ya está registrado, devolver 409 Conflict
            const statusCode = result.message.includes('ya está registrado') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message: result.message,
                data: {
                    phone: result.phone,
                },
            });
        }
    }
    catch (error) {
        console.error('Error en registerCode2FA:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
});
exports.registerCode2FA = registerCode2FA;
/**
 * POST /api/sms/verifycode2FA
 * Verificar código 2FA
 * Acceso: Público (no requiere autenticación)
 */
const verificationCode2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, code } = req.body;
        const result = yield smsService.verifyCode2FA(phone, code);
        if (result.success && result.verified) {
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    phone: result.phone,
                    verified: true,
                },
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.message,
                data: {
                    phone: result.phone,
                    verified: false,
                },
            });
        }
    }
    catch (error) {
        console.error('Error en verificationCode2FA:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
        });
    }
});
exports.verificationCode2FA = verificationCode2FA;
/**
 * POST /api/sms/check-phone
 * Verificar si un teléfono ya está registrado
 * Acceso: Público
 */
const checkPhoneExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        const result = yield smsService.checkPhoneExists(phone);
        if (result.exists) {
            // Ya registrado → redirigir al login
            res.status(200).json({
                success: true,
                exists: true,
                redirect: 'login',
                message: 'Este número ya tiene una cuenta. Inicia sesión.',
                phone: result.phone,
            });
        }
        else {
            res.status(200).json({
                success: true,
                exists: false,
                redirect: 'register',
                message: 'Número disponible para registro.',
                phone: result.phone,
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
});
exports.checkPhoneExists = checkPhoneExists;
//FAKE 
const verificationFake = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    res.status(200).json({
        success: true,
        message: 'Código verificado exitosamente',
        data: {
            phone: phone,
            verified: true,
        },
    });
});
exports.verificationFake = verificationFake;
