import { GeneralSettingsRepository } from '../repositories/generalsettings.repository';
import { Prisma } from '@prisma/client';

const settingsRepo = new GeneralSettingsRepository();

export class GeneralSettingsService {
  /**
   * Crear variable — solo PAYPAC
   */
  async createSetting(
    data: { name: string; value: string; description?: string },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede crear variables de configuración');
    }

    // Validar nombre único
    const existing = await settingsRepo.findByName(data.name);
    if (existing) {
      throw new Error(`Ya existe una variable con el nombre "${data.name}"`);
    }

    return settingsRepo.create({
      name: data.name,
      value: data.value,
      description: data.description,
    });
  }

  /**
   * Listar variables — solo PAYPAC
   */
  async getSettings(userRole: string, filters?: { search?: string }) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver las variables de configuración');
    }

    return settingsRepo.findAll(filters);
  }

  /**
   * Variable por ID — solo PAYPAC
   */
  async getSettingById(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver las variables de configuración');
    }

    const setting = await settingsRepo.findById(id);
    if (!setting) {
      throw new Error('Variable de configuración no encontrada');
    }
    return setting;
  }

  /**
   * Variable por nombre — solo PAYPAC
   * Útil para consultar un parámetro específico por clave
   */
  async getSettingByName(name: string, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede ver las variables de configuración');
    }

    const setting = await settingsRepo.findByName(name);
    if (!setting) {
      throw new Error(`Variable "${name}" no encontrada`);
    }
    return setting;
  }

  /**
   * Actualizar variable — solo PAYPAC
   */
  async updateSetting(
    id: number,
    data: { name?: string; value?: string; description?: string },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede actualizar variables de configuración');
    }

    const setting = await settingsRepo.findById(id);
    if (!setting) {
      throw new Error('Variable de configuración no encontrada');
    }

    // Validar nombre único si se está cambiando
    if (data.name && data.name !== setting.name) {
      const existing = await settingsRepo.findByName(data.name);
      if (existing) {
        throw new Error(`Ya existe una variable con el nombre "${data.name}"`);
      }
    }

    const updateData: Prisma.GeneralSettingsVariablesUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.description !== undefined) updateData.description = data.description;

    return settingsRepo.update(id, updateData);
  }

  /**
   * Eliminar variable — solo PAYPAC
   */
  async deleteSetting(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede eliminar variables de configuración');
    }

    const setting = await settingsRepo.findById(id);
    if (!setting) {
      throw new Error('Variable de configuración no encontrada');
    }

    return settingsRepo.delete(id);
  }
}