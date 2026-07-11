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
exports.BrevoService = void 0;
const brevo = __importStar(require("@getbrevo/brevo"));
const brevo_1 = require("../config/brevo");
class BrevoService {
    /**
     * Enviar un email transaccional usando Brevo
     */
    sendEmail(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const sendSmtpEmail = new brevo.SendSmtpEmail();
                sendSmtpEmail.subject = params.subject;
                sendSmtpEmail.to = [params.to];
                sendSmtpEmail.htmlContent = params.htmlContent;
                sendSmtpEmail.sender = {
                    name: brevo_1.brevoConfig.senderName,
                    email: brevo_1.brevoConfig.senderEmail,
                };
                const result = yield brevo_1.brevoApiInstance.sendTransacEmail(sendSmtpEmail);
                // La respuesta de Brevo tiene esta estructura:
                // { response: IncomingMessage, body: CreateSmtpEmail }
                const messageId = ((_a = result.body) === null || _a === void 0 ? void 0 : _a.messageId) || ((_c = (_b = result.response) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c['x-message-id']) || 'unknown';
                console.log('✅ Email enviado exitosamente:', {
                    messageId,
                    to: params.to.email,
                    statusCode: (_d = result.response) === null || _d === void 0 ? void 0 : _d.statusCode,
                });
                return {
                    success: true,
                    messageId: String(messageId),
                };
            }
            catch (error) {
                console.error('❌ Error al enviar email con Brevo:', error);
                return {
                    success: false,
                    error: error.message || 'Error desconocido al enviar email',
                };
            }
        });
    }
    /**
     * Enviar múltiples emails (batch)
     * Útil para notificaciones masivas
     */
    sendBatchEmails(emails) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const email of emails) {
                const result = yield this.sendEmail(email);
                results.push(result);
                // Delay entre envíos para evitar rate limiting
                yield this.delay(100);
            }
            return results;
        });
    }
    /**
     * Validar configuración de Brevo
     */
    validateConfig() {
        if (!brevo_1.brevoConfig.apiKey) {
            throw new Error('BREVO_API_KEY no configurada');
        }
    }
    /**
     * Helper: delay en milisegundos
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.BrevoService = BrevoService;
