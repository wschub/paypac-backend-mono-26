// test-email-queue.ts
import { NotificationMessageQueueService } from './services/notificationmessagequeue.service';

const service = new NotificationMessageQueueService();

async function test() {
  try {
    const result = await service.queueEmail({
      userId: 19, // Usa un user_id válido de tu BD
      email: "davidminestroich@gmail.com",
      templateCode: 'REGISTRATION_ACCEPT',
      variables: {
      name:'Juan David',
      last_name:'Rodríguez',
      inviter_name:'Alejandro',
      inviter_last_name:'Orozco',
      role:'ORGANIZADOR',
      email:'davidminestroich@gmail.com',
      accept_link:'https://paypac.com/accept-invitation',
      },
    });

    console.log('✅ Email encolado:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

test();