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
exports.markEventViewConversion = void 0;
const eventView_service_1 = require("../services/eventView.service");
const eventViewService = new eventView_service_1.EventViewService();
const markEventViewConversion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { session_token } = req.body;
        const result = yield eventViewService.markConversion(Number(id), session_token);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in markEventViewConversion:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to mark conversion' });
    }
});
exports.markEventViewConversion = markEventViewConversion;
