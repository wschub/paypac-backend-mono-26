import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { prisma } from '../prisma/client';

/**
 * Middleware de autenticación Firebase
 *
 * ✅ OPTIMIZACIONES APLICADAS:
 * 1. findUnique en lugar de findFirst (requiere @unique en firebase_uid)
 *    - findUnique usa el índice único → O(1) en vez de scan secuencial
 * 2. verifyIdToken ya cachea JWKS keys internamente en Firebase Admin SDK
 *    - Primera llamada: descarga keys de Google (~300ms)
 *    - Llamadas posteriores: verificación local con crypto (~2-5ms)
 *    - NO se necesita cache Redis adicional para esto
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // 1. Verificar token con Firebase
    //    ⚠️ Firebase Admin SDK cachea las JWKS keys después del primer call
    //    Las verificaciones subsecuentes son operaciones de crypto local (~2-5ms)
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // 2. ✅ OPTIMIZACIÓN: findUnique en lugar de findFirst
    //    Requiere que firebase_uid tenga @unique en schema.prisma
    //    Con el índice único, esta query es O(1) en vez de scan secuencial
    const user = await prisma.user.findUnique({
      where: { firebase_uid: firebaseUid },
    });

    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado en el sistema' });
      return;
    }

    // 3. Inyectar en req.user
    req.user = user;

    next();
  } catch (error: any) {
    console.error('Error en autenticación Firebase:', error.message);

    // Diferenciar tipos de error para mejor debugging
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ message: 'Token expirado' });
    } else if (error.code === 'auth/argument-error') {
      res.status(401).json({ message: 'Token malformado' });
    } else {
      res.status(401).json({ message: 'Token inválido' });
    }
    return;
  }
};