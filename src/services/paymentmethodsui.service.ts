import { PaymentMethodsUIRepository } from '../repositories/paymentmethodsui.repository';
import { Prisma } from '@prisma/client';

const paymentMethodsUIRepo = new PaymentMethodsUIRepository();

export class PaymentMethodsUIService {
  /**
   * Crear un nuevo método de pago
   * Solo PAYPAC puede crear métodos de pago
   */
  async createPaymentMethod(
    data: Prisma.PaymentMethodsUICreateInput,
    userRole: string
  ) {
    // Validar que solo PAYPAC pueda crear métodos
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear métodos de pago');
    }

    // Validar que no exista un método con el mismo nombre
    const existingMethod = await paymentMethodsUIRepo.findByName(data.method_name);
    if (existingMethod) {
      throw new Error(`Ya existe un método de pago con el nombre "${data.method_name}"`);
    }

    return paymentMethodsUIRepo.create(data);
  }

  /**
   * Obtener todos los métodos de pago
   * Puede filtrar por status (activos/inactivos)
   */
  async getPaymentMethods(filters?: { method_status?: number }) {
    return paymentMethodsUIRepo.findAll(filters);
  }

  /**
   * Obtener solo métodos de pago activos
   * Este endpoint lo usará el frontend para mostrar opciones de pago
   */
  async getActivePaymentMethods() {
    return paymentMethodsUIRepo.findAll({ method_status: 1 });
  }

  /**
   * Obtener método de pago por ID
   */
  async getPaymentMethodById(id: number) {
    const method = await paymentMethodsUIRepo.findById(id);
    if (!method) {
      throw new Error('Método de pago no encontrado');
    }
    return method;
  }

  /**
   * Actualizar método de pago
   * Solo PAYPAC puede actualizar
   */
  async updatePaymentMethod(
    id: number,
    data: Prisma.PaymentMethodsUIUpdateInput,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar métodos de pago');
    }

    const method = await paymentMethodsUIRepo.findById(id);
    if (!method) {
      throw new Error('Método de pago no encontrado');
    }

    // Si se está cambiando el nombre, validar que no exista otro con ese nombre
    if (data.method_name && typeof data.method_name === 'string') {
      const existingMethod = await paymentMethodsUIRepo.findByName(data.method_name);
      if (existingMethod && existingMethod.id !== id) {
        throw new Error(`Ya existe otro método de pago con el nombre "${data.method_name}"`);
      }
    }

    return paymentMethodsUIRepo.update(id, data);
  }

  /**
   * Actualizar solo el status del método de pago
   * Solo PAYPAC puede cambiar el status
   */
  async updatePaymentMethodStatus(
    id: number,
    method_status: number,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede cambiar el status de métodos de pago');
    }

    const method = await paymentMethodsUIRepo.findById(id);
    if (!method) {
      throw new Error('Método de pago no encontrado');
    }

    return paymentMethodsUIRepo.update(id, { method_status });
  }

  /**
   * Eliminar método de pago
   * Solo PAYPAC puede eliminar
   * TODO: Validar que no haya usuarios con este método asociado
   */
  async deletePaymentMethod(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar métodos de pago');
    }

    const method = await paymentMethodsUIRepo.findById(id);
    if (!method) {
      throw new Error('Método de pago no encontrado');
    }

    // TODO: Validar que no haya PaymentMethodsUsers asociados
    // const usersWithMethod = await prisma.paymentMethodsUsers.count({
    //   where: { method_id: id }
    // });
    // if (usersWithMethod > 0) {
    //   throw new Error('No se puede eliminar: hay usuarios usando este método');
    // }

    return paymentMethodsUIRepo.delete(id);
  }

  /**
   * Obtener estadísticas de métodos de pago
   * Solo PAYPAC puede ver estadísticas
   */
  async getPaymentMethodsStats(userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver estadísticas');
    }

    const allMethods = await paymentMethodsUIRepo.findAll();
    const activeCount = await paymentMethodsUIRepo.countActive();

    return {
      total: allMethods.length,
      active: activeCount,
      inactive: allMethods.length - activeCount,
      methods: allMethods,
    };
  }
}