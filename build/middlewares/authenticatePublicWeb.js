"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePublicWeb = void 0;
const constants_1 = require("../config/constants");
const authenticatePublicWeb = (req, res, next) => {
    var _a;
    const apiKey = req.headers['x-web-api-key'] ||
        ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
    if (!apiKey || apiKey !== constants_1.WEB_API_KEY) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing web API key'
        });
        return;
    }
    next();
};
exports.authenticatePublicWeb = authenticatePublicWeb;
