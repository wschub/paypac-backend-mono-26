import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import { verifyWompiSignature } from '../utils/wompi.utils';
import { WompiWebhookEvent } from '../types/wompi.types';

const webhookService = new WebhookService();

/**
 * POST /api/webhooks/wompi
 * Wompi envía este webhook cuando cambia el estado de una transacción
 */
export const wompiWebhook = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔔 WEBHOOK RECIBIDO DE WOMPI');
    console.log('='.repeat(80));
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📨 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(80) + '\n');

    const webhookData = req.body as WompiWebhookEvent;
    const { event, data, signature, timestamp, environment } = webhookData;

    // ============================================
    // 1️⃣ VERIFICAR FIRMA DEL WEBHOOK (SEGURIDAD)
    // ============================================
    console.log('🔐 PASO 1: Verificando firma del webhook...');
    console.log('   Environment:', environment);
    console.log('   Event:', event);
    console.log('   Timestamp:', timestamp);
    console.log('   Signature checksum:', signature.checksum);
    console.log('   Signature properties:', signature.properties);

    const isValidSignature = verifyWompiSignature(webhookData);

    if (!isValidSignature) {
      console.error('❌ FIRMA INVÁLIDA - WEBHOOK RECHAZADO');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    console.log('✅ Firma verificada correctamente\n');

    // ============================================
    // 2️⃣ VALIDAR AMBIENTE
    // ============================================
    console.log('🌍 PASO 2: Validando ambiente...');
    const expectedEnv = process.env.WOMPI_MODE === 'sandbox' ? 'test' : 'production';
    console.log('   WOMPI_MODE:', process.env.WOMPI_MODE);
    console.log('   Ambiente esperado:', expectedEnv);
    console.log('   Ambiente recibido:', environment);

    if (environment !== expectedEnv) {
      console.error('');
      console.error('❌ AMBIENTE INCORRECTO');
      console.error('   Esperado:', expectedEnv);
      console.error('   Recibido:', environment);
      console.error('');
      console.error('💡 DIAGNÓSTICO:');

      if (process.env.WOMPI_MODE === 'prod') {
        console.error('   ❌ ERROR EN .ENV: WOMPI_MODE="prod" debe ser WOMPI_MODE="production"');
      } else if (environment === 'test' && process.env.WOMPI_MODE === 'production') {
        console.error('   ❌ El frontend está enviando transacciones de PRUEBA (sandbox)');
        console.error('   📱 Solución: Usar PUB_PRO en lugar de PUB_TEST en la app');
      } else if (environment === 'production' && process.env.WOMPI_MODE === 'sandbox') {
        console.error('   ❌ El frontend está enviando transacciones REALES');
        console.error('   📱 Solución: Cambiar WOMPI_MODE a "production" en .env');
      }
      console.error('');

      res.status(400).json({
        message: 'Invalid environment',
        expected: expectedEnv,
        received: environment,
        wompi_mode: process.env.WOMPI_MODE,
      });
      return;
    }

    console.log('✅ Ambiente validado correctamente\n');

    // ============================================
    // 3️⃣ PROCESAR EVENTO
    // ============================================
    console.log('📊 PASO 3: Procesando evento...');
    console.log('   Tipo de evento:', event);

    if (event === 'transaction.updated') {
      await webhookService.handleTransactionUpdated(data.transaction);
    } else {
      console.log(`ℹ️ Evento no manejado: ${event}`);
    }

    const processingTime = Date.now() - startTime;
    console.log('\n' + '='.repeat(80));
    console.log('✅ WEBHOOK PROCESADO EXITOSAMENTE');
    console.log('⏱️  Tiempo de procesamiento:', processingTime, 'ms');
    console.log('='.repeat(80) + '\n');

    // ============================================
    // 4️⃣ RESPONDER A WOMPI (SIEMPRE 200)
    // ============================================
    res.status(200).json({
      received: true,
      processing_time_ms: processingTime,
    });
  } catch (error: any) {
    console.error('\n' + '❌'.repeat(40));
    console.error('❌ ERROR CRÍTICO EN WEBHOOK');
    console.error('❌'.repeat(40));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌'.repeat(40) + '\n');

    // Siempre respondemos 200 para que Wompi no reintente
    res.status(200).json({
      received: true,
      error: error.message,
    });
  }
};