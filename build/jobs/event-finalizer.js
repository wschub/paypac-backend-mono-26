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
exports.startEventFinalizer = startEventFinalizer;
const db_1 = require("../config/db");
const event_liquidation_service_1 = require("../services/event_liquidation.service");
const liquidationService = new event_liquidation_service_1.EventLiquidationService();
function startEventFinalizer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⏰ [CRON] Event Finalizer iniciado — revisión cada hora');
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            console.log('🔄 [CRON] Buscando eventos para finalizar...');
            try {
                const now = new Date();
                // Buscar eventos ACTIVE cuya fecha de fin ya pasó
                const eventsToFinalize = yield db_1.prisma.event.findMany({
                    where: {
                        status: 'ACTIVE',
                        date_end_event: { lte: now },
                    },
                    select: { id: true, name: true, date_end_event: true },
                });
                if (eventsToFinalize.length === 0) {
                    console.log('✅ [CRON] No hay eventos para finalizar');
                    return;
                }
                console.log(`📋 [CRON] ${eventsToFinalize.length} evento(s) para finalizar`);
                for (const event of eventsToFinalize) {
                    try {
                        // 1. Cambiar status a FINALIZED
                        yield db_1.prisma.event.update({
                            where: { id: event.id },
                            data: { status: 'FINALIZED' },
                        });
                        console.log(`✅ [CRON] Evento ${event.id} "${event.name}" → FINALIZED`);
                        // 2. Crear liquidación automática
                        yield liquidationService.autoCreateFromEvent(event.id);
                    }
                    catch (eventError) {
                        console.error(`❌ [CRON] Error procesando evento ${event.id}:`, eventError.message);
                        // Continúa con el siguiente evento
                    }
                }
            }
            catch (err) {
                console.error('❌ [CRON] Error en Event Finalizer:', err.message);
            }
        }), 60 * 60 * 1000); // cada hora
    });
}
