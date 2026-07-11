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
// test-email-queue.ts
const notificationmessagequeue_service_1 = require("./services/notificationmessagequeue.service");
const service = new notificationmessagequeue_service_1.NotificationMessageQueueService();
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield service.queueEmail({
                userId: 19, // Usa un user_id válido de tu BD
                email: "davidminestroich@gmail.com",
                templateCode: 'REGISTRATION_ACCEPT',
                variables: {
                    name: 'Juan David',
                    last_name: 'Rodríguez',
                    inviter_name: 'Alejandro',
                    inviter_last_name: 'Orozco',
                    role: 'ORGANIZADOR',
                    email: 'davidminestroich@gmail.com',
                    accept_link: 'https://paypac.com/accept-invitation',
                },
            });
            console.log('✅ Email encolado:', result);
        }
        catch (error) {
            console.error('❌ Error:', error);
        }
    });
}
test();
