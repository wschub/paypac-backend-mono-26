import * as cron from 'node-cron';
import { TicketSaleRepository } from '../repositories/ticket_sale.repository';
import { TicketSaleService } from '../services/ticket_sale.service';

const saleRepo = new TicketSaleRepository();
const saleService = new TicketSaleService();

/**
 * CRON Job — resuelve publicaciones de reventa (TicketSaleListing) ACTIVE
 * cuyo expires_at ya pasó. Si tienen una oferta PENDING, se acepta la más
 * alta automáticamente (mismo flujo que el vendedor aceptándola a mano); si
 * no tienen ninguna, se marcan EXPIRED. Se ejecuta cada 10 minutos.
 */
export function startTicketSaleExpiry(): void {
  const cronExpression = '*/10 * * * *';

  cron.schedule(cronExpression, async () => {
    console.log('🔄 [CRON] Buscando publicaciones de reventa expiradas...');
    try {
      const expired = await saleRepo.findExpiredActive();

      if (expired.length === 0) {
        console.log('✅ [CRON] No hay publicaciones de reventa expiradas');
        return;
      }

      console.log(`📋 [CRON] ${expired.length} publicación(es) de reventa expirada(s)`);

      for (const listing of expired) {
        try {
          await saleService.autoResolveExpiredListing(listing.id);
          console.log(`✅ [CRON] Listing ${listing.id} resuelto`);
        } catch (listingError: any) {
          console.error(`❌ [CRON] Error resolviendo listing ${listing.id}:`, listingError.message);
        }
      }
    } catch (err: any) {
      console.error('❌ [CRON] Error en Ticket Sale Expiry:', err.message);
    }
  });

  console.log('✅ CRON Job de Ticket Sale Expiry iniciado (cada 10 minutos)');
}
