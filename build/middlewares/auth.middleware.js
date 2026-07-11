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
exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const client_1 = require("../prisma/client");
/**
 * Middleware de autenticación Firebase
 *
 * ✅ OPTIMIZACIONES APLICADAS:
 * 1. findUnique en lugar de findFirst (requiere @unique en firebase_uid)
 *    - findUnique usa el índice único → O(1) en vez de scan secuencial
 * 2. verifyIdToken ya cachea JWKS keys internamente en Firebase Admin SDK
 *    - Primera llamada: descarga keys de Google (~300ms)
 *    - Llamadas posteriores: verificación local con crypto (~2-5ms)
 *    - NO se necesita cache Redis adicional para esto
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }
    const idToken = authHeader.split(' ')[1];
    try {
        // 1. Verificar token con Firebase
        //    ⚠️ Firebase Admin SDK cachea las JWKS keys después del primer call
        //    Las verificaciones subsecuentes son operaciones de crypto local (~2-5ms)
        const decodedToken = yield firebase_1.firebaseAuth.verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;
        // 2. ✅ OPTIMIZACIÓN: findUnique en lugar de findFirst
        //    Requiere que firebase_uid tenga @unique en schema.prisma
        //    Con el índice único, esta query es O(1) en vez de scan secuencial
        const user = yield client_1.prisma.user.findUnique({
            where: { firebase_uid: firebaseUid },
        });
        if (!user) {
            res.status(401).json({ message: 'Usuario no encontrado en el sistema' });
            return;
        }
        // 3. Inyectar en req.user
        req.user = user;
        next();
    }
    catch (error) {
        console.error('🔐 Firebase auth error — code:', error.code, '| message:', error.message);
        if (error.code === 'auth/id-token-expired') {
            res.status(401).json({ message: 'Token expirado' });
        }
        else if (error.code === 'auth/argument-error') {
            res.status(401).json({ message: 'Token malformado' });
        }
        else if (error.code === 'auth/id-token-revoked') {
            res.status(401).json({ message: 'Token revocado' });
        }
        else {
            res.status(401).json({ message: 'Token inválido', code: (_a = error.code) !== null && _a !== void 0 ? _a : 'unknown' });
        }
        return;
    }
});
exports.authenticate = authenticate;
