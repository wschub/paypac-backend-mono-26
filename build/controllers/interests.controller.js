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
exports.InterestsController = void 0;
const interests_service_1 = require("../services/interests.service");
const interestsService = new interests_service_1.InterestsService();
class InterestsController {
    getMyInterests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const interests = yield interestsService.getMyInterests(userId);
                res.status(200).json({ interests });
            }
            catch (error) {
                console.error('Error in getMyInterests:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch interests' });
            }
        });
    }
    createInterest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { category_id, subcategory_id, subgenre_id, interest_level } = req.body;
                const interest = yield interestsService.createInterest(userId, category_id, subcategory_id, subgenre_id, interest_level);
                res.status(201).json({ interest });
            }
            catch (error) {
                console.error('Error in createInterest:', error);
                if (error.message.includes('Ya tienes este interés')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                if (error.message.includes('no encontrad')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to create interest' });
            }
        });
    }
    updateInterest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const interestId = parseInt(req.params.id);
                const { interest_level } = req.body;
                const interest = yield interestsService.updateInterest(userId, interestId, interest_level);
                res.status(200).json({ interest });
            }
            catch (error) {
                console.error('Error in updateInterest:', error);
                if (error.message.includes('no encontrado')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to update interest' });
            }
        });
    }
    deleteInterest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const interestId = parseInt(req.params.id);
                yield interestsService.deleteInterest(userId, interestId);
                res.status(200).json({ message: 'Interés eliminado exitosamente' });
            }
            catch (error) {
                console.error('Error in deleteInterest:', error);
                if (error.message.includes('no encontrado')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to delete interest' });
            }
        });
    }
}
exports.InterestsController = InterestsController;
