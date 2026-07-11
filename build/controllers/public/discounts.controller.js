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
exports.validatePublicCode = void 0;
const eventrewardrules_service_1 = require("../../services/eventrewardrules.service");
const rewardRulesService = new eventrewardrules_service_1.EventRewardRulesService();
/**
 * GET /api/public/discounts/validate/:code?event_id=123
 * Versión pública (X-Web-API-Key) del validador unificado de códigos:
 * type: 'discount' (dcto del organizador) | 'promoter' (código de promotor)
 */
const validatePublicCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = String(req.params.code).toUpperCase().trim();
        const eventId = Number(req.query.event_id);
        if (!eventId) {
            res.status(400).json({ message: 'event_id es requerido' });
            return;
        }
        const result = yield rewardRulesService.validateCode(code, eventId);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en validatePublicCode:', err);
        res.status(400).json({ message: err.message });
    }
});
exports.validatePublicCode = validatePublicCode;
