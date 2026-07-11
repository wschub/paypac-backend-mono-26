"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
            return; // 👈 Agrega return para cortar el flujo correctamente
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
