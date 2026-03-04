import { prisma } from '../config/db';
import { Transactions, Prisma } from '@prisma/client';

export class TransactionRepository {

  //test dlete 
  // transaction.repository.ts




  /**
   * Crear una nueva transacción
   */
  async create(data: Prisma.TransactionsUncheckedCreateInput): Promise<Transactions> {
    return prisma.transactions.create({
      data,
    });
  }

  /**
   * Buscar transacción por ID
   */
  async findById(id: number): Promise<Transactions | null> {
    return prisma.transactions.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar transacción por reference (num_invoice)
   */
  async findByReference(reference: string): Promise<Transactions | null> {
    return prisma.transactions.findFirst({
      where: { reference },
    });
  }

  /**
   * Buscar transacciones de un usuario
   */
  async findByUserId(userId: number): Promise<Transactions[]> {
    return prisma.transactions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
  
  /**
   * Todas las transacciones
   */
  async findAll(): Promise<Transactions[]> {
  return prisma.transactions.findMany({
    orderBy: { created_at: 'desc' },
  });
}

  /**
   * Buscar transacción por invoice_id
   */
  async findByInvoiceId(invoiceId: string): Promise<Transactions | null> {
    return prisma.transactions.findFirst({
      where: { invoice_id: invoiceId },
    });
  }

  /**
   * Actualizar transacción
   */
  async update(id: number, data: Prisma.TransactionsUpdateInput): Promise<Transactions> {
    return prisma.transactions.update({
      where: { id },
      data,
    });
  }

  /**
   * Actualizar status de la transacción
   */
  async updateStatus(
  id: number,
  status: string,
  statusMessage: string,
  finalizedAt?: Date,
  extra?: {
    payment_method?: Prisma.InputJsonValue;
    customer_data?: string;
    meta?: Prisma.InputJsonValue;
  }
): Promise<Transactions> {
  return prisma.transactions.update({
    where: { id },
    data: {
      status,
      status_message: statusMessage,
      finalized_at: finalizedAt ?? new Date(),
      ...(extra?.payment_method !== undefined && { payment_method: extra.payment_method }),
      ...(extra?.customer_data  !== undefined && { customer_data:  extra.customer_data  }),
      ...(extra?.meta           !== undefined && { meta:           extra.meta           }),
    },
  });
}

  /**
   * Verificar si existe una transacción
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.transactions.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar transacciones por usuario
   */
  async countByUser(userId: number): Promise<number> {
    return prisma.transactions.count({
      where: { user_id: userId },
    });
  }

  /**
   * Obtener transacciones por status
   */
  async findByStatus(status: string): Promise<Transactions[]> {
    return prisma.transactions.findMany({
      where: { status },
      orderBy: { created_at: 'desc' },
    });
  }
}


