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
exports.PointsController = void 0;
const points_service_1 = require("../services/points.service");
const pointsService = new points_service_1.PointsService();
class PointsController {
    getBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const balance = yield pointsService.getBalance(userId);
                res.status(200).json({ balance });
            }
            catch (error) {
                console.error('Error in getBalance:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch points balance' });
            }
        });
    }
    getHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 20;
                const type = req.query.type;
                const result = yield pointsService.getHistory(userId, page, limit, type);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in getHistory:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch points history' });
            }
        });
    }
    transferPoints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fromUserId = req.user.id;
                const { to_user_id, points, description } = req.body;
                const result = yield pointsService.transferPoints(fromUserId, to_user_id, points, description);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in transferPoints:', error);
                if (error.message.includes('No puedes transferir') ||
                    error.message.includes('Saldo insuficiente') ||
                    error.message.includes('cantidad de puntos')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                if (error.message.includes('no encontrado')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to transfer points' });
            }
        });
    }
    getExpiringPoints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const result = yield pointsService.getExpiringPoints(userId);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in getExpiringPoints:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch expiring points' });
            }
        });
    }
}
exports.PointsController = PointsController;
