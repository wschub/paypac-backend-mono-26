import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Jul 6 2026 21:15 hora Bogotá (UTC-5) = Jul 7 2026 02:15 UTC
const newStart = new Date('2026-07-07T02:15:00.000Z');

const updated = await prisma.eventStages.updateMany({
  where: { stage_name: 'PRE VENTA', id: { in: [91, 92] } },
  data: { date_start: newStart },
});

console.log(`✅ PRE VENTA actualizada (${updated.count} registros)`);
console.log(`   Nuevo inicio: ${newStart.toISOString()} → Jul 6 21:15 hora Bogotá`);

await prisma.$disconnect();
