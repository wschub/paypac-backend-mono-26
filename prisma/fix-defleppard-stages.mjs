/**
 * Corrección: las etapas del concierto Def Leppard fueron guardadas
 * con hora local de Bogotá (UTC-5) sin conversión a UTC.
 * Fix: sumar 5 horas a todas las fechas de sus etapas.
 */
import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OFFSET_MS = 5 * 60 * 60 * 1000; // UTC-5 → +5h

const event = await prisma.event.findFirst({
  where: { name: { contains: 'Def', mode: 'insensitive' } },
  select: { id: true, name: true }
});

if (!event) { console.error('Evento Def Leppard no encontrado'); process.exit(1); }

const locs = await prisma.eventLocalities.findMany({
  where: { event_id: event.id },
  select: { id: true }
});

const stages = await prisma.eventStages.findMany({
  where: { locality_id: { in: locs.map(l => l.id) } },
  select: { id: true, stage_name: true, date_start: true, date_end: true }
});

console.log(`\n🎸 ${event.name} — corrigiendo ${stages.length} etapas\n`);

for (const s of stages) {
  const newStart = new Date(s.date_start.getTime() + OFFSET_MS);
  const newEnd   = new Date(s.date_end.getTime()   + OFFSET_MS);

  await prisma.eventStages.update({
    where: { id: s.id },
    data: { date_start: newStart, date_end: newEnd }
  });

  console.log(`  ✔ [${s.id}] ${s.stage_name}`);
  console.log(`      start: ${s.date_start.toISOString()} → ${newStart.toISOString()}`);
  console.log(`      end:   ${s.date_end.toISOString()}   → ${newEnd.toISOString()}`);
}

console.log('\n✅ Corrección aplicada');
await prisma.$disconnect();
