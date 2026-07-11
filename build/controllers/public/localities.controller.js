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
exports.getPublicLocalities = void 0;
const locality_service_1 = require("../../services/locality.service");
const localityService = new locality_service_1.LocalityService();
const getPublicLocalities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.params;
        const result = yield localityService.getPublicLocalitiesByEvent(Number(eventId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicLocalities:', error);
        res.status(404).json({ error: 'Not Found', message: 'Event not found or no active localities' });
    }
});
exports.getPublicLocalities = getPublicLocalities;
