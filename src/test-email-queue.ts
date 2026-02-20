// test-email-queue.ts
import { NotificationMessageQueueService } from './services/notificationmessagequeue.service';

const service = new NotificationMessageQueueService();

async function test() {
  try {
    const result = await service.queueEmail({
      userId: 19, // Usa un user_id válido de tu BD
      email: '"davidminestroich@gmail.com"',
      templateCode: 'REGISTRATION_VERIFY',
      variables: {
        user_name: 'Juan Pérez',
        otp_code: '123456',
      },
    });

    console.log('✅ Email encolado:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();