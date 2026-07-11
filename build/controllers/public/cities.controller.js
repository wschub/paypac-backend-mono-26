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
exports.getPublicCities = void 0;
const city_service_1 = require("../../services/city.service");
const cityService = new city_service_1.CityService();
const getPublicCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.query;
        const result = yield cityService.getPublicCities(country_id ? Number(country_id) : undefined);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicCities:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch cities' });
    }
});
exports.getPublicCities = getPublicCities;
