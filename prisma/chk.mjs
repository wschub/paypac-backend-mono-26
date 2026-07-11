import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const txs = await prisma.ticketTransaction.findMany({ orderBy: { created_at: 'desc' }, take: 2 });
for (const tx of txs) {
  const t = await prisma.ticket.findUnique({ where: { id: tx.ticket_id }, select: { id: true, customer_id: true, customer_uid: true, status_ticket: true } });
  console.log(`tx ${tx.id} status=${tx.status_ticket} from=${tx.from_customer_id} to=${tx.to_customer_id} → ticket:`, JSON.stringify(t));
}
await prisma.$disconnect();
