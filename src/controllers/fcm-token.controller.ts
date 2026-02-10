import { Request, Response } from 'express';
import { prisma } from '../config/db';

/**
 * Actualizar FCM token del usuario
 * PUT /api/users/fcm-token
 */
export const updateFcmToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id; // Del middleware de autenticación
    const { fcm_token } = req.body;

    if (!fcm_token || typeof fcm_token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'FCM token es requerido',
      });
      return;
    }

    console.log('📱 Actualizando FCM token del usuario:', userId);
    console.log('   Token:', fcm_token.substring(0, 20) + '...');

    // Actualizar token en la BD
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fcm_token: fcm_token,
        fcm_updated: new Date(),
      },
      select: {
        id: true,
        email: true,
        fcm_updated: true,
      },
    });

    console.log('✅ FCM token actualizado correctamente');

    res.status(200).json({
      success: true,
      message: 'FCM token actualizado',
      data: {
        user_id: user.id,
        updated_at: user.fcm_updated,
      },
    });
  } catch (error: any) {
    console.error('❌ Error actualizando FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar FCM token',
      error: error.message,
    });
  }
};

/**
 * Eliminar FCM token del usuario (logout)
 * DELETE /api/users/fcm-token
 */
export const deleteFcmToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    console.log('📱 Eliminando FCM token del usuario:', userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        fcm_token: null,
        fcm_updated: null,
      },
    });

    console.log('✅ FCM token eliminado correctamente');

    res.status(200).json({
      success: true,
      message: 'FCM token eliminado',
    });
  } catch (error: any) {
    console.error('❌ Error eliminando FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar FCM token',
      error: error.message,
    });
  }
};