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
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }
    const idToken = authHeader.split(' ')[1];
    try {
        // 1. Verificar token con Firebase
        const decodedToken = yield firebase_1.firebaseAuth.verifyIdToken(idToken);
        const firebaseUid = decodedToken.uid;
        // 2. Obtener usuario de PostgreSQL (usando findFirst en lugar de findUnique)
        const user = yield client_1.prisma.user.findFirst({
            where: { firebase_uid: firebaseUid },
        });
        if (!user) {
            res.status(401).json({ message: 'Usuario no encontrado en el sistema' });
            return;
        }
        // 3. Inyectar en req.user
        req.user = user;
        console.log('Usuario autenticado:', {
            id: user.id,
            email: user.email,
            role: user.role,
        });
        next();
    }
    catch (error) {
        console.error('Error en autenticación Firebase:', error.message);
        res.status(401).json({ message: 'Token inválido' });
        return;
    }
});
exports.authenticate = authenticate;
