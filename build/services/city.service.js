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
exports.CityService = void 0;
const client_1 = require("../prisma/client");
const constants_1 = require("../config/constants");
class CityService {
    getPublicCities(countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetCountryId = countryId || constants_1.DEFAULT_COUNTRY_ID;
            // Todas las ciudades del país habilitado
            const cities = yield client_1.prisma.cities.findMany({
                where: {
                    country_id: targetCountryId,
                },
                select: {
                    id: true,
                    name_city: true,
                    country_id: true,
                },
                orderBy: { name_city: 'asc' },
            });
            return {
                data: cities,
                total: cities.length,
            };
        });
    }
}
exports.CityService = CityService;
