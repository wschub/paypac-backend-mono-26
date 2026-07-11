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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBrevoConfig = exports.brevoApiInstance = exports.brevoConfig = void 0;
const brevo = __importStar(require("@getbrevo/brevo"));
/**
 * Configuración de Brevo API
 */
exports.brevoConfig = {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'notifications@paypac.com.co',
    senderName: process.env.BREVO_SENDER_NAME || 'Paypac Notifications',
};
/**
 * Instancia configurada de Brevo API
 */
exports.brevoApiInstance = new brevo.TransactionalEmailsApi();
exports.brevoApiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, exports.brevoConfig.apiKey);
/**
 * Validar que la API key esté configurada
 */
const validateBrevoConfig = () => {
    if (!exports.brevoConfig.apiKey) {
        throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }
    if (!exports.brevoConfig.senderEmail) {
        console.warn('⚠️ BREVO_SENDER_EMAIL no está configurado, usando valor por defecto');
    }
    console.log('✅ Brevo API configurada correctamente');
};
exports.validateBrevoConfig = validateBrevoConfig;
