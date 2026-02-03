import { UserRepository } from '../repositories/user.repository';
import { firebaseAuth } from '../config/firebase';
import { ROLES } from '@prisma/client';

const userRepository = new UserRepository();

export class AuthService {
  /**
   * Registrar usuario (Admin crea usuarios)
   * Ahora crea en Firebase Auth + PostgreSQL
   */
  
  async register(data: {
  name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: ROLES;
  company_id: number;
}) {
    let firebaseUid: string | null = null;

  try {
    // 1. ✅ Verificar que el email no exista en PostgreSQL
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    // 2. ✅ Crear usuario en Firebase Auth
    const firebaseUser = await firebaseAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.name} ${data.last_name}`,
      phoneNumber: data.phone_number,
      emailVerified: false,
    });
    
     firebaseUid = firebaseUser.uid;
      console.log('✅ Usuario creado en Firebase:', firebaseUid);

    // 3. Guardar en PostgreSQL
      const user = await userRepository.create({
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password: 'firebase_managed',
        phone_number: data.phone_number, // ← snake_case
        role: data.role,
        company_id: data.company_id,
        firebase_uid: firebaseUid,
        auth_method: 'firebase',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Usuario creado en PostgreSQL:', user.id);

    // 4. ✅ Establecer Custom Claims en Firebase
    await firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
      userId: user.id,
      companyId: user.company_id,
      role: user.role,
    });

     console.log('✅ Custom claims establecidos');

     //4.1 ✅ Generar Custom Token (esto SÍ devuelve un token)
      const customToken = await firebaseAuth.createCustomToken(firebaseUser.uid,{
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
      });

    // 5. Retornar datos del usuario
      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number, // ← snake_case
        role: user.role,
        company_id: user.company_id,
        uid: user.firebase_uid,
        customToken:customToken,
      };

  } catch (error: any) {
    console.error('❌ Error en registro:', error.message);

      // Rollback: Si falla PostgreSQL y el usuario fue creado en Firebase, eliminarlo
      if (firebaseUid) {
        try {
          await firebaseAuth.deleteUser(firebaseUid);
          console.log('🔄 Rollback: Usuario eliminado de Firebase');
        } catch (rollbackError: any) {
          // Si el usuario no existe en Firebase, no hacer nada
          if (rollbackError.code === 'auth/user-not-found') {
            console.log('ℹ️ Usuario ya no existe en Firebase, rollback no necesario');
          } else {
            console.error('❌ Error en rollback:', rollbackError.message);
          }
        }
      }

      // Re-lanzar el error original
      throw new Error(error.message || 'Error al registrar usuario');
  }
}
  /* async register(data: {
    full_name: string;
    surname: string;
    email: string;
    password: string;
    role: string;
    company_id: number;
  }) {
    try {
      // 1. Verificar que el email no exista en PostgreSQL
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new Error('Email already in use');
      }

      // 2. Crear usuario en Firebase Auth
      const firebaseUser = await firebaseAuth.createUser({
        email: data.email,
        password: data.password,
        displayName: `${data.full_name} ${data.surname}`,
        emailVerified: false,
      });

      console.log('✅ Usuario creado en Firebase:', firebaseUser.uid);

      // 3. Guardar en PostgreSQL
      const user = await userRepository.create({
        full_name: data.full_name,
        surname: data.surname,
        email: data.email,
        password: 'firebase_managed', // No guardamos contraseña real
        role: data.role,
        company_id: data.company_id,
        firebase_uid: firebaseUser.uid,
        auth_method: 'firebase',
      });

      console.log('✅ Usuario creado en PostgreSQL:', user.id);

      // 4. Establecer Custom Claims en Firebase (opcional pero recomendado)
      await firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
      });

      console.log('✅ Custom claims establecidos');

      // 5. Retornar datos del usuario (sin token, Firebase lo maneja)
      return {
        id: user.id,
        full_name: user.full_name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        firebase_uid: user.firebase_uid,
      };
    } catch (error: any) {
      console.error('❌ Error en registro:', error);

      // Rollback: Si falla PostgreSQL, eliminar de Firebase
      if (error.message !== 'Email already in use') {
        try {
          const firebaseUser = await firebaseAuth.getUserByEmail(data.email);
          await firebaseAuth.deleteUser(firebaseUser.uid);
          console.log('🔄 Rollback: Usuario eliminado de Firebase');
        } catch (cleanupError) {
          console.error('Error en rollback:', cleanupError);
        }
      }

      throw new Error(error.message || 'Error al registrar usuario');
    }
  } */

  /**
   * ❌ login - YA NO SE USA
   * Firebase maneja login en el frontend con signInWithEmailAndPassword()
   * Puedes eliminar este método
   */
  // async login(email: string, password: string) { ... }

  /**
   * Obtener todos los usuarios
   * Se mantiene igual
   */
  async getUsers() {
    const users = await userRepository.findAll();
    return users;
  }

  /**
   * ❌ generateToken - YA NO SE USA
   * Firebase genera los tokens automáticamente
   * Puedes eliminar este método
   */
  // private generateToken(user: any) { ... }
}