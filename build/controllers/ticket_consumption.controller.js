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
exports.getConsumptionHistory = exports.registerConsumption = void 0;
const ticket_consumption_service_1 = require("../services/ticket_consumption.service");
const service = new ticket_consumption_service_1.TicketConsumptionService();
const registerConsumption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = parseInt(req.params['id']);
        const user = req.user;
        const { amount, description } = req.body;
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ error: 'Bad request', message: 'El campo amount debe ser un número positivo' });
            return;
        }
        const result = yield service.registerConsumption(ticketId, amount, description, user.id);
        res.status(201).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.registerConsumption = registerConsumption;
const getConsumptionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = parseInt(req.params['id']);
        const user = req.user;
        const result = yield service.getHistory(ticketId, user.id, user.role);
        res.status(200).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.getConsumptionHistory = getConsumptionHistory;
function _handleError(res, error) {
    var _a;
    const msg = (_a = error.message) !== null && _a !== void 0 ? _a : '';
    if (msg.includes('no encontrad'))
        return res.status(404).json({ error: 'Not found', message: msg });
    if (msg.includes('permiso'))
        return res.status(403).json({ error: 'Forbidden', message: msg });
    if (msg.includes('insuficiente') || msg.includes('no es de tipo')) {
        return res.status(409).json({ error: 'Conflict', message: msg });
    }
    res.status(400).json({ error: 'Bad request', message: msg });
}
