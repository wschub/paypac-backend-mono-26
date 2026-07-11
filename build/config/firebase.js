"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAdmin = exports.firebaseAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
/**
 * Inicialización de Firebase Admin SDK
 *
 * Soporta múltiples métodos de autenticación:
 * 1. Application Default Credentials (desarrollo local con gcloud)
 * 2. Workload Identity (producción en Google Cloud)
 * 3. Service Account Key (si está disponible)
 */
if (!firebase_admin_1.default.apps.length) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasServiceAccountKey = process.env.FIREBASE_PRIVATE_KEY;
    if (hasServiceAccountKey) {
        // Método 1: Usar clave de cuenta de servicio (si está disponible)
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
        });
        console.log('✅ Firebase inicializado con Service Account Key');
    }
    else if (isDevelopment) {
        // Método 2: Application Default Credentials (desarrollo local)
        // Requiere: gcloud auth application-default login
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
        });
        console.log('✅ Firebase inicializado con Application Default Credentials');
    }
    else {
        // Método 3: Workload Identity (producción en Google Cloud)
        // Cloud Run, Cloud Functions, App Engine usan automáticamente la identidad del servicio
        firebase_admin_1.default.initializeApp();
        console.log('✅ Firebase inicializado con Workload Identity');
    }
}
exports.firebaseAuth = firebase_admin_1.default.auth();
exports.firebaseAdmin = firebase_admin_1.default;
