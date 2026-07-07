import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const event = await prisma.event.findFirst({
  where: { name: { contains: 'Def', mode: 'insensitive' } },
  select: { id: true, name: true, date_event: true }
});
console.log('Event:', JSON.stringify(event, null, 2));

if (event) {
  const locs = await prisma.eventLocalities.findMany({
    where: { event_id: event.id },
    select: { id: true, name_locality: true }
  });
  const stages = await prisma.eventStages.findMany({
    where: { locality_id: { in: locs.map(l => l.id) } },
    orderBy: [{ stage_name: 'asc' }, { date_start: 'asc' }],
    select: { id: true, stage_name: true, date_start: true, date_end: true, locality_id: true }
  });
  console.log('Localities:', JSON.stringify(locs, null, 2));
  console.log('Stages:', JSON.stringify(stages, null, 2));
}

await prisma.$disconnect();
