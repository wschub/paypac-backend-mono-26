import axios from 'axios';
import { onurixConfig } from '../config/onurix';
import { prisma } from '../config/db';

export interface SendCode2FAResult {
  success: boolean;
  message: string;
  phone?: string;
  error?: string;
}

export interface VerifyCode2FAResult {
  success: boolean;
  message: string;
  phone?: string;
  verified?: boolean;
  error?: string;
}

export class SmsService {
  /**
   * Enviar código 2FA por SMS
   * Valida que el teléfono NO esté registrado en la BD
   */
  async sendCode2FA(phone: string): Promise<SendCode2FAResult> {
    try {
      // 1. Validar que el teléfono NO esté registrado
      const existingUser = await prisma.user.findFirst({
        where: { phone_number: phone },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Este número de teléfono ya está registrado',
          phone,
        };
      }

      // 2. Preparar datos para Onurix
      const data = {
        client: onurixConfig.client,
        key: onurixConfig.key,
        phone: phone,
        'app-name': onurixConfig.appName,
      };

      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };

      // 3. Enviar código a Onurix
      const response = await axios.post(onurixConfig.sendUrl, data, { headers });

      console.log('✅ Código 2FA enviado:', {
        phone,
        response: response.data,
      });

      return {
        success: true,
        message: 'Código de verificación enviado exitosamente',
        phone,
      };
    } catch (error: any) {
      console.error('❌ Error enviando código 2FA:', error.response?.data || error.message);

      return {
        success: false,
        message: 'Error al enviar código de verificación',
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Verificar código 2FA
   * Valida el código de 6 dígitos contra Onurix
   */
  async verifyCode2FA(phone: string, code: string): Promise<VerifyCode2FAResult> {
    try {
      // 1. Preparar datos para Onurix
      const data = {
        client: onurixConfig.client,
        key: onurixConfig.key,
        phone: phone,
        'app-name': onurixConfig.appName,
        code: code,
      };

      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };

      // 2. Verificar código con Onurix
      const response = await axios.post(onurixConfig.verifyUrl, data, { headers });

      console.log('✅ Código 2FA verificado:', {
        phone,
        status: response.data.status,
      });

      // 3. Interpretar respuesta de Onurix
      const isVerified = response.data.verified === true || response.data.status === 1;

      if (isVerified) {
        return {
          success: true,
          message: 'Código verificado exitosamente',
          phone,
          verified: true,
        };
      } else {
        return {
          success: false,
          message: 'Código inválido o expirado',
          phone,
          verified: false,
        };
      }
    } catch (error: any) {
      console.error('❌ Error verificando código 2FA:', error.response?.data || error.message);

      return {
        success: false,
        message: 'Error al verificar código',
        verified: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Validar configuración de Onurix
   */
  validateConfig(): void {
    if (!onurixConfig.client || !onurixConfig.key) {
      throw new Error('Credenciales de Onurix no configuradas');
    }
  }
}