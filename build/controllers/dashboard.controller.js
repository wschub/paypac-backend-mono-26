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
exports.getOrganizerAppDashboard = exports.getOrganizerDashboard = exports.getPaypacDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
const getPaypacDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield dashboardService.getPaypacDashboard();
        res.status(200).json(data);
    }
    catch (err) {
        console.error('❌ Error en getPaypacDashboard:', err);
        res.status(500).json({ message: err.message });
    }
});
exports.getPaypacDashboard = getPaypacDashboard;
const getOrganizerDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user.company_id) {
            res.status(400).json({ message: 'El usuario no tiene empresa asignada' });
            return;
        }
        const data = yield dashboardService.getOrganizerDashboard(user.id, user.company_id);
        res.status(200).json(data);
    }
    catch (err) {
        console.error('❌ Error en getOrganizerDashboard:', err);
        res.status(500).json({ message: err.message });
    }
});
exports.getOrganizerDashboard = getOrganizerDashboard;
//organizer app dashboard
const getOrganizerAppDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const data = yield dashboardService.getOrganizerAppDashboard(user.id);
        res.status(200).json(data);
    }
    catch (err) {
        console.error('❌ Error en getOrganizerAppDashboard:', err);
        res.status(500).json({ message: err.message });
    }
});
exports.getOrganizerAppDashboard = getOrganizerAppDashboard;
