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
exports.getUsers = exports.verifyEmailCode = exports.resendVerification = exports.deleteAccount = exports.getProfile = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
/**
 * POST /auth/register (Público)
 * POST /auth/new-user (Protegido)
 *
 * Crear usuario:
 * - /register: Auto-registro de CUSTOMER (sin autenticación)
 * - /new-user: PAYPAC/ORGANIZER crean staff/promotores (con autenticación)
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, last_name, email, password, role, company_id, phone_number, source, num_doc, type_doc, birth_date, lang_user, country_id, gender, social_token, } = req.body;
    try {
        // Determinar si es auto-registro o creación por admin
        const isAdminCreation = !!req.user; // Si req.user existe, es admin autenticado
        let finalCompanyId = null;
        let createdBy = undefined;
        if (isAdminCreation) {
            // ✅ Creación por admin (endpoint /new-user)
            finalCompanyId = company_id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.company_id) || null;
            createdBy = {
                userId: req.user.id,
                userRole: req.user.role,
            };
            console.log(`👤 Admin ${createdBy.userRole} (ID: ${createdBy.userId}) creando usuario`);
        }
        else {
            // ✅ Auto-registro (endpoint /register)
            // Para CUSTOMER no es obligatorio company_id
            finalCompanyId = null;
            console.log('👤 Auto-registro de nuevo usuario');
        }
        const result = yield authService.register({
            name,
            last_name,
            email,
            password,
            role,
            company_id: finalCompanyId,
            phone_number,
            source,
            num_doc,
            type_doc,
            birth_date: birth_date ? new Date(birth_date) : undefined,
            lang_user,
            country_id,
            gender,
            social_token,
        }, createdBy);
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.register = register;
/**
 * GET /auth/me
 * Obtener perfil del usuario autenticado
 */
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            num_doc: user.num_doc,
            type_doc: user.type_doc,
            role: user.role,
            company_id: user.company_id,
            firebase_uid: user.firebase_uid,
            verified_user: user.verified_user,
            email_verified_at: user.email_verified_at,
            phone_number_verified_at: user.phone_number_verified_at,
            birth_date: user.birth_date,
            gender: user.gender,
            country_id: user.country_id,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});
exports.getProfile = getProfile;
/**
 * DELETE /auth/account
 * Eliminar cuenta del usuario autenticado (cumplimiento Google Play Store)
 */
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield authService.deleteAccount(req.user.id, req.user.firebase_uid);
        res.json({ message: 'Cuenta eliminada exitosamente' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteAccount = deleteAccount;
/**
 * POST /auth/resend-verification
 * Reenviar código OTP de verificación de email (app)
 */
const resendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield authService.resendVerificationEmail(req.user.id);
        res.json({ message: 'Código reenviado a tu email' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.resendVerification = resendVerification;
/**
 * POST /auth/verify-email
 * Verificar email con código OTP — app (código manual) y web (código desde URL)
 */
const verifyEmailCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code || typeof code !== 'string') {
            res.status(400).json({ message: 'Código requerido' });
            return;
        }
        yield authService.verifyEmailCode(req.user.id, code);
        res.status(201).json({ message: 'Email verificado exitosamente' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.verifyEmailCode = verifyEmailCode;
/**
 * GET /auth/users
 * Listar usuarios (solo admin)
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.getUsers();
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getUsers = getUsers;
