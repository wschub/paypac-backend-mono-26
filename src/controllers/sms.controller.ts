import { Request, Response } from 'express';
import { SmsService } from '../services/sms.service';

const smsService = new SmsService();

/**
 * POST /api/sms/getcode2FA
 * Enviar código 2FA por SMS
 * Acceso: Público (no requiere autenticación)
 */
export const registerCode2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    const result = await smsService.sendCode2FA(phone);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          phone: result.phone,
        },
      });
    } else {
      // Si el teléfono ya está registrado, devolver 409 Conflict
      const statusCode = result.message.includes('ya está registrado') ? 409 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: result.message,
        data: {
          phone: result.phone,
        },
      });
    }
  } catch (error: any) {
    console.error('Error en registerCode2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

/**
 * POST /api/sms/verifycode2FA
 * Verificar código 2FA
 * Acceso: Público (no requiere autenticación)
 */
export const verificationCode2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = req.body;

    const result = await smsService.verifyCode2FA(phone, code);

    if (result.success && result.verified) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          phone: result.phone,
          verified: true,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: {
          phone: result.phone,
          verified: false,
        },
      });
    }
  } catch (error: any) {
    console.error('Error en verificationCode2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};


//FAKE 
export const verificationFake = async (req: Request, res: Response): Promise<void> => {
   
   const { phone } = req.body;

   res.status(200).json({
        success: true,
        message: 'Código verificado exitosamente',
        data: {
          phone: phone,
          verified: true,
        },
      });
}