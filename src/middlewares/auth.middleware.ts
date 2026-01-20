// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { prisma } from '../prisma/client';

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
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // 2. Obtener usuario de PostgreSQL (usando findFirst en lugar de findUnique)
    const user = await prisma.user.findFirst({
      where: { firebase_uid: firebaseUid },
    });

    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado en el sistema' });
      return;
    }

    // 3. Inyectar en req.user
    req.user = user;
    
    console.log('Usuario autenticado:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    next();
  } catch (error: any) {
    console.error('Error en autenticación Firebase:', error.message);
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
};