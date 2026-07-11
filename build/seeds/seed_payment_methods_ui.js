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
/**
 * Seed de la tabla PaymentMethodsUI.
 *
 * Carga los métodos de pago Wompi soportados por la capa polimórfica
 * (src/services/payment-methods). method_code coincide con el `type` de Wompi
 * y con los códigos del PaymentMethodFactory.
 *
 * method_status: 1 = visible/activo para los frontales (web/app), 0 = oculto.
 * Se activan a medida que se vayan implementando en los frontales con:
 *   PUT /api/payment-methods/:id  { "method_status": 1 }
 *
 * Ejecutar: npx ts-node src/seeds/seed_payment_methods_ui.ts
 */
const db_1 = require("../config/db");
const METHODS = [
    {
        method_code: 'CARD',
        method_name: 'Tarjeta de crédito / débito',
        mehtod_img: '/assets/payments/card.png',
        method_status: 1, // ya implementado
    },
    {
        method_code: 'NEQUI',
        method_name: 'Nequi',
        mehtod_img: '/assets/payments/nequi.png',
        method_status: 0,
    },
    {
        method_code: 'PSE',
        method_name: 'PSE — Débito bancario',
        mehtod_img: '/assets/payments/pse.png',
        method_status: 0,
    },
    {
        method_code: 'BANCOLOMBIA_TRANSFER',
        method_name: 'Botón Bancolombia',
        mehtod_img: '/assets/payments/bancolombia.png',
        method_status: 0,
    },
    {
        method_code: 'BANCOLOMBIA_QR',
        method_name: 'QR Bancolombia',
        mehtod_img: '/assets/payments/bancolombia-qr.png',
        method_status: 0,
    },
    {
        method_code: 'BANCOLOMBIA_COLLECT',
        method_name: 'Efectivo — Corresponsal Bancolombia',
        mehtod_img: '/assets/payments/efectivo.png',
        method_status: 0,
    },
    {
        method_code: 'DAVIPLATA',
        method_name: 'Daviplata',
        mehtod_img: '/assets/payments/daviplata.png',
        method_status: 0,
    },
    {
        method_code: 'BANCOLOMBIA_BNPL',
        method_name: 'BNPL Bancolombia — 4 cuotas sin interés',
        mehtod_img: '/assets/payments/bnpl.png',
        method_status: 0,
    },
    {
        method_code: 'PCOL',
        method_name: 'Puntos Colombia',
        mehtod_img: '/assets/payments/puntos-colombia.png',
        method_status: 0,
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Seed PaymentMethodsUI...');
        for (const method of METHODS) {
            const existing = yield db_1.prisma.paymentMethodsUI.findFirst({
                where: { method_code: method.method_code },
            });
            if (existing) {
                // No tocar method_status si ya existe (respeta lo configurado en admin)
                yield db_1.prisma.paymentMethodsUI.update({
                    where: { id: existing.id },
                    data: {
                        method_name: method.method_name,
                        mehtod_img: method.mehtod_img,
                    },
                });
                console.log(`   ↺ ${method.method_code} actualizado (status conservado: ${existing.method_status})`);
            }
            else {
                yield db_1.prisma.paymentMethodsUI.create({ data: method });
                console.log(`   ✚ ${method.method_code} creado (status: ${method.method_status})`);
            }
        }
        console.log('✅ Seed PaymentMethodsUI completado');
    });
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(() => db_1.prisma.$disconnect());
