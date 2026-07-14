import * as cron from 'node-cron';
import { prisma } from '../config/db';
import { EventLiquidationService } from '../services/event_liquidation.service';

const liquidationService = new EventLiquidationService();

/**
 * CRON Job — finaliza eventos ACTIVE cuya date_end_event ya pasó, y dispara
 * la liquidación automática (cierre de cartera) de cada uno.
 * Se ejecuta cada 10 minutos.
 */
export function startEventFinalizer(): void {
  const cronExpression = '*/10 * * * *';

  cron.schedule(cronExpression, async () => {
    console.log('🔄 [CRON] Buscando eventos para finalizar...');
    try {
      const now = new Date();

      // Buscar eventos ACTIVE cuya fecha de fin ya pasó
      const eventsToFinalize = await prisma.event.findMany({
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
          await prisma.event.update({
            where: { id: event.id },
            data: { status: 'FINALIZED' },
          });
          console.log(`✅ [CRON] Evento ${event.id} "${event.name}" → FINALIZED`);

          // 2. Crear liquidación automática (cierre de cartera + cálculos)
          await liquidationService.autoCreateFromEvent(event.id);

        } catch (eventError: any) {
          console.error(`❌ [CRON] Error procesando evento ${event.id}:`, eventError.message);
          // Continúa con el siguiente evento
        }
      }

    } catch (err: any) {
      console.error('❌ [CRON] Error en Event Finalizer:', err.message);
    }
  });

  console.log('✅ CRON Job de Event Finalizer iniciado (cada 10 minutos)');
}