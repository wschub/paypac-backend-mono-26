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
exports.GeneralSettingsService = void 0;
const generalsettings_repository_1 = require("../repositories/generalsettings.repository");
const settingsRepo = new generalsettings_repository_1.GeneralSettingsRepository();
class GeneralSettingsService {
    /**
     * Crear variable — solo PAYPAC
     */
    createSetting(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear variables de configuración');
            }
            // Validar nombre único
            const existing = yield settingsRepo.findByName(data.name);
            if (existing) {
                throw new Error(`Ya existe una variable con el nombre "${data.name}"`);
            }
            return settingsRepo.create({
                name: data.name,
                value: data.value,
                description: data.description,
            });
        });
    }
    /**
     * Listar variables — solo PAYPAC
     */
    getSettings(userRole, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver las variables de configuración');
            }
            return settingsRepo.findAll(filters);
        });
    }
    /**
     * Variable por ID — solo PAYPAC
     */
    getSettingById(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver las variables de configuración');
            }
            const setting = yield settingsRepo.findById(id);
            if (!setting) {
                throw new Error('Variable de configuración no encontrada');
            }
            return setting;
        });
    }
    /**
     * Variable por nombre — solo PAYPAC
     * Útil para consultar un parámetro específico por clave
     */
    getSettingByName(name, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver las variables de configuración');
            }
            const setting = yield settingsRepo.findByName(name);
            if (!setting) {
                throw new Error(`Variable "${name}" no encontrada`);
            }
            return setting;
        });
    }
    /**
     * Actualizar variable — solo PAYPAC
     */
    updateSetting(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar variables de configuración');
            }
            const setting = yield settingsRepo.findById(id);
            if (!setting) {
                throw new Error('Variable de configuración no encontrada');
            }
            // Validar nombre único si se está cambiando
            if (data.name && data.name !== setting.name) {
                const existing = yield settingsRepo.findByName(data.name);
                if (existing) {
                    throw new Error(`Ya existe una variable con el nombre "${data.name}"`);
                }
            }
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.value !== undefined)
                updateData.value = data.value;
            if (data.description !== undefined)
                updateData.description = data.description;
            return settingsRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar variable — solo PAYPAC
     */
    deleteSetting(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar variables de configuración');
            }
            const setting = yield settingsRepo.findById(id);
            if (!setting) {
                throw new Error('Variable de configuración no encontrada');
            }
            return settingsRepo.delete(id);
        });
    }
}
exports.GeneralSettingsService = GeneralSettingsService;
