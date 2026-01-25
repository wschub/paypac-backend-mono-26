import * as cron from 'node-cron';
import { NotificationMessageQueueService } from '../services/notificationmessagequeue.service';

const queueService = new NotificationMessageQueueService();

/**
 * CRON Job para procesar la cola de emails pendientes
 * Se ejecuta cada 5 minutos
 */
export const startEmailQueueProcessor = () => {
  const cronExpression = '*/5 * * * *';
  
  cron.schedule(cronExpression, async () => {
    try {
      console.log('🔄 [CRON] Iniciando procesamiento de cola de emails...');
      
      const result = await queueService.processPendingMessages();
      
      console.log(`✅ [CRON] Procesamiento completado:`, {
        enviados: result.sent,
        fallidos: result.failed,
        total: result.total,
      });
    } catch (error: any) {
      console.error('❌ [CRON] Error procesando cola de emails:', error.message);
    }
  });

  console.log('✅ CRON Job de email queue iniciado (cada 5 minutos)');
};

/**
 * CRON Job para limpiar mensajes antiguos
 * Se ejecuta cada día a las 2:00 AM
 */
export const startEmailQueueCleaner = () => {
  const cronExpression = '0 2 * * *';
  
  cron.schedule(cronExpression, async () => {
    try {
      console.log('🧹 [CRON] Iniciando limpieza de mensajes antiguos...');
      
      const result = await queueService.cleanOldMessages(30, 'PAYPAC');
      
      console.log(`✅ [CRON] Limpieza completada: ${result.deleted} mensajes eliminados`);
    } catch (error: any) {
      console.error('❌ [CRON] Error limpiando mensajes antiguos:', error.message);
    }
  });

  console.log('✅ CRON Job de limpieza iniciado (diario a las 2:00 AM)');
};