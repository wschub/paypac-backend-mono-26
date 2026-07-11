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
exports.updateEventViewDuration = exports.createEventView = void 0;
const eventView_service_1 = require("../../services/eventView.service");
const eventViewService = new eventView_service_1.EventViewService();
const createEventView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = yield eventViewService.createView(Number(id), data, req);
        const statusCode = result.message === 'View created' ? 201 : 200;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error('Error in createEventView:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to create view' });
    }
});
exports.createEventView = createEventView;
const updateEventViewDuration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, sessionToken } = req.params;
        const { duration } = req.body;
        const result = yield eventViewService.updateDuration(Number(id), String(sessionToken), duration);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in updateEventViewDuration:', error);
        res.status(404).json({ error: 'Not Found', message: 'View not found' });
    }
});
exports.updateEventViewDuration = updateEventViewDuration;
