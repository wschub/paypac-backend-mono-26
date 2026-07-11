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
exports.deleteFcmToken = exports.updateFcmToken = void 0;
const db_1 = require("../config/db");
/**
 * Actualizar FCM token del usuario
 * PUT /api/users/fcm-token
 */
const updateFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // Del middleware de autenticación
        const { fcm_token } = req.body;
        if (!fcm_token || typeof fcm_token !== 'string') {
            res.status(400).json({
                success: false,
                message: 'FCM token es requerido',
            });
            return;
        }
        console.log('📱 Actualizando FCM token del usuario:', userId);
        console.log('   Token:', fcm_token.substring(0, 20) + '...');
        // Actualizar token en la BD
        const user = yield db_1.prisma.user.update({
            where: { id: userId },
            data: {
                fcm_token: fcm_token,
                fcm_updated: new Date(),
            },
            select: {
                id: true,
                email: true,
                fcm_updated: true,
            },
        });
        console.log('✅ FCM token actualizado correctamente');
        res.status(200).json({
            success: true,
            message: 'FCM token actualizado',
            data: {
                user_id: user.id,
                updated_at: user.fcm_updated,
            },
        });
    }
    catch (error) {
        console.error('❌ Error actualizando FCM token:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar FCM token',
            error: error.message,
        });
    }
});
exports.updateFcmToken = updateFcmToken;
/**
 * Eliminar FCM token del usuario (logout)
 * DELETE /api/users/fcm-token
 */
const deleteFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        console.log('📱 Eliminando FCM token del usuario:', userId);
        yield db_1.prisma.user.update({
            where: { id: userId },
            data: {
                fcm_token: null,
                fcm_updated: null,
            },
        });
        console.log('✅ FCM token eliminado correctamente');
        res.status(200).json({
            success: true,
            message: 'FCM token eliminado',
        });
    }
    catch (error) {
        console.error('❌ Error eliminando FCM token:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar FCM token',
            error: error.message,
        });
    }
});
exports.deleteFcmToken = deleteFcmToken;
