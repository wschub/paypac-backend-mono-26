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
exports.startEmailQueueCleaner = exports.startEmailQueueProcessor = void 0;
const cron = __importStar(require("node-cron"));
const notificationmessagequeue_service_1 = require("../services/notificationmessagequeue.service");
const queueService = new notificationmessagequeue_service_1.NotificationMessageQueueService();
/**
 * CRON Job para procesar la cola de emails pendientes
 * Se ejecuta cada 5 minutos
 */
const startEmailQueueProcessor = () => {
    const cronExpression = '*/5 * * * *';
    cron.schedule(cronExpression, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('🔄 [CRON] Iniciando procesamiento de cola de emails...');
            const result = yield queueService.processPendingMessages();
            console.log(`✅ [CRON] Procesamiento completado:`, {
                enviados: result.sent,
                fallidos: result.failed,
                total: result.total,
            });
        }
        catch (error) {
            console.error('❌ [CRON] Error procesando cola de emails:', error.message);
        }
    }));
    console.log('✅ CRON Job de email queue iniciado (cada 5 minutos)');
};
exports.startEmailQueueProcessor = startEmailQueueProcessor;
/**
 * CRON Job para limpiar mensajes antiguos
 * Se ejecuta cada día a las 2:00 AM
 */
const startEmailQueueCleaner = () => {
    const cronExpression = '0 2 * * *';
    cron.schedule(cronExpression, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('🧹 [CRON] Iniciando limpieza de mensajes antiguos...');
            const result = yield queueService.cleanOldMessages(30, 'PAYPAC');
            console.log(`✅ [CRON] Limpieza completada: ${result.deleted} mensajes eliminados`);
        }
        catch (error) {
            console.error('❌ [CRON] Error limpiando mensajes antiguos:', error.message);
        }
    }));
    console.log('✅ CRON Job de limpieza iniciado (diario a las 2:00 AM)');
};
exports.startEmailQueueCleaner = startEmailQueueCleaner;
