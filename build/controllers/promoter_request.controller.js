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
exports.rejectRequest = exports.approveRequest = exports.getAllRequests = exports.getMyRequest = exports.applyToBePromoter = void 0;
const promoter_request_service_1 = require("../services/promoter_request.service");
const service = new promoter_request_service_1.PromoterRequestService();
const applyToBePromoter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { motivation } = req.body;
        const request = yield service.apply(userId, motivation);
        res.status(201).json({ request });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.applyToBePromoter = applyToBePromoter;
const getMyRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const request = yield service.getMyRequest(userId);
        res.status(200).json({ request });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.getMyRequest = getMyRequest;
const getAllRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.query.status;
        const requests = yield service.getAll(status);
        res.status(200).json({ requests });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.getAllRequests = getAllRequests;
const approveRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestId = parseInt(req.params['id']);
        const reviewerId = req.user.id;
        const request = yield service.approve(requestId, reviewerId);
        res.status(200).json({ request });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.approveRequest = approveRequest;
const rejectRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestId = parseInt(req.params['id']);
        const reviewerId = req.user.id;
        const { rejection_reason } = req.body;
        const request = yield service.reject(requestId, reviewerId, rejection_reason);
        res.status(200).json({ request });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.rejectRequest = rejectRequest;
function _handleError(res, error) {
    var _a;
    const msg = (_a = error.message) !== null && _a !== void 0 ? _a : '';
    if (msg.includes('no encontrad'))
        return res.status(404).json({ error: 'Not found', message: msg });
    if (msg.includes('Ya eres') || msg.includes('Ya tienes') || msg.includes('ya fue')) {
        return res.status(409).json({ error: 'Conflict', message: msg });
    }
    res.status(400).json({ error: 'Bad request', message: msg });
}
