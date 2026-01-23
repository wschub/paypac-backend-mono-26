import { prisma } from '../config/db';
import { PaymentMethodsUI, Prisma } from '@prisma/client';

export class PaymentMethodsUIRepository {
  /**
   * Crear un nuevo método de pago
   */
  async create(data: Prisma.PaymentMethodsUICreateInput): Promise<PaymentMethodsUI> {
    return prisma.paymentMethodsUI.create({
      data,
    });
  }

  /**
   * Obtener todos los métodos de pago
   * Opcionalmente filtrar por status
   */
  async findAll(filters?: { method_status?: number }): Promise<PaymentMethodsUI[]> {
    const where: Prisma.PaymentMethodsUIWhereInput = {};

    if (filters?.method_status !== undefined) {
      where.method_status = filters.method_status;
    }

    return prisma.paymentMethodsUI.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar método de pago por ID
   */
  async findById(id: number): Promise<PaymentMethodsUI | null> {
    return prisma.paymentMethodsUI.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar método de pago por nombre
   */
  async findByName(method_name: string): Promise<PaymentMethodsUI | null> {
    return prisma.paymentMethodsUI.findFirst({
      where: { 
        method_name: {
          equals: method_name,
          mode: 'insensitive', // Case-insensitive
        }
      },
    });
  }

  /**
   * Actualizar método de pago
   */
  async update(id: number, data: Prisma.PaymentMethodsUIUpdateInput): Promise<PaymentMethodsUI> {
    return prisma.paymentMethodsUI.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar método de pago
   */
  async delete(id: number): Promise<PaymentMethodsUI> {
    return prisma.paymentMethodsUI.delete({
      where: { id },
    });
  }

  /**
   * Verificar si un método de pago existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.paymentMethodsUI.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar métodos de pago activos
   */
  async countActive(): Promise<number> {
    return prisma.paymentMethodsUI.count({
      where: { method_status: 1 },
    });
  }
}