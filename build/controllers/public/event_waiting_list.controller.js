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
exports.registerWaitingList = void 0;
const event_waiting_list_service_1 = require("../../services/event_waiting_list.service");
const service = new event_waiting_list_service_1.EventWaitingListService();
const registerWaitingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const entry = yield service.register(req.body);
        res.status(201).json({ entry });
    }
    catch (error) {
        console.error('Error in registerWaitingList:', error);
        if (error.message.includes('ya está registrado')) {
            return res.status(409).json({ error: 'Conflict', message: error.message });
        }
        if (error.message.includes('no encontrad')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Error al registrar en lista de espera' });
    }
});
exports.registerWaitingList = registerWaitingList;
