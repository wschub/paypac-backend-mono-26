import { prisma } from '../config/db';
import { TicketRepository } from '../repositories/ticket.repository';
 
const ticketRepo = new TicketRepository();
 
export async function startTicketTransferExpiry(): Promise<void> {
  console.log('⏰ [CRON] Ticket Transfer Expiry iniciado — revisión cada hora');
 
  setInterval(async () => {
    console.log('🔄 [CRON] Buscando transferencias expiradas...');
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 48); // 48 horas atrás
 
      // Buscar transacciones PENDING donde el destinatario sigue siendo placeholder
      // (to_customer_id === from_customer_id indica que no se ha asignado receptor real)
      const expired = await prisma.ticketTransaction.findMany({
        where: {
          status_ticket: 'PENDING',
          created_at:    { lte: cutoff },
          // Destinatario sigue sin registrarse (to = from es el placeholder)
          // O directamente llevan más de 48h pendientes
        },
      });
 
      if (expired.length === 0) {
        console.log('✅ [CRON] No hay transferencias expiradas');
        return;
      }
 
      console.log(`📋 [CRON] ${expired.length} transferencia(s) expirada(s)`);
 
      for (const tx of expired) {
        try {
          // Devolver ticket al remitente
          await ticketRepo.transferOwnership(
            tx.ticket_id,
            tx.from_customer_id,
            tx.from_customer_uid,
            tx.from_customer_UUID_phone,
            tx.from_customer_token,
          );
          await ticketRepo.updateStatus(tx.ticket_id, 'ACTIVE' as any);
 
          // Cancelar la transacción
          await prisma.ticketTransaction.update({
            where: { id: tx.id },
            data:  { status_ticket: 'CANCELLED' },
          });
 
          console.log(`✅ [CRON] Transacción ${tx.id} expirada — ticket ${tx.ticket_id} devuelto`);
 
          // Notificar al remitente
          try {
            const { io } = await import('../index');
            io.to(`user:${tx.from_customer_id}`).emit('ticket:transfer:expired', {
              transaction_id: tx.id,
              ticket_id:      tx.ticket_id,
              message:        'La transferencia expiró. Tu ticket está de vuelta en tu Wallet.',
              timestamp:      new Date().toISOString(),
            });
          } catch {}
 
        } catch (txError: any) {
          console.error(`❌ [CRON] Error procesando tx ${tx.id}:`, txError.message);
        }
      }
 
    } catch (err: any) {
      console.error('❌ [CRON] Error en Ticket Transfer Expiry:', err.message);
    }
  }, 60 * 60 * 1000); // cada hora
}