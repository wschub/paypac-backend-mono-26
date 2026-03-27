import { UserRepository } from '../repositories/user.repository';
import { firebaseAuth } from '../config/firebase';
import { ROLES } from '@prisma/client';
import { NotificationMessageQueueService } from './notificationmessagequeue.service';

const userRepository = new UserRepository();
const emailService = new NotificationMessageQueueService();

export class AuthService {
  /**
   * Registrar usuario
   * Funciona para:
   * - Auto-registro de CUSTOMER (público)
   * - Creación de usuarios por PAYPAC/ORGANIZER (protegido)
   */
  async register(
    data: {
      name: string;
      last_name: string;
      email: string;
      password: string;
      phone_number: string;
      role: ROLES; // ← Cambio de string a ROLES
      company_id?: number | null;
    },
    createdBy?: {
      userId: number;
      userRole: string;
    }
  ) {
    let firebaseUid: string | null = null;

    try {
      // 1. ✅ Verificar que el email no exista en PostgreSQL
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new Error('Email already in use');
      }

      // 2. ✅ Validar reglas de negocio según quien crea el usuario
      if (createdBy) {
        // Usuario creado por admin (PAYPAC/ORGANIZER)
        console.log(`👤 Usuario creado por: ${createdBy.userRole} (ID: ${createdBy.userId})`);

        // PAYPAC puede crear cualquier rol
        // ORGANIZER solo puede crear STAFF, STAFF_PROMOTER, PROMOTER
        if (createdBy.userRole === 'ORGANIZER') {
          const allowedRoles: ROLES[] = [ROLES.STAFF, ROLES.STAFF_PROMOTER, ROLES.PROMOTER, ROLES.CUSTOMER];
          if (!allowedRoles.includes(data.role)) {
            throw new Error('ORGANIZER solo puede crear usuarios con roles: STAFF, STAFF_PROMOTER, PROMOTER, CUSTOMER');
          }
        }
      } else {
        // Auto-registro (debe ser CUSTOMER)
        if (data.role !== ROLES.CUSTOMER) {
          throw new Error('El auto-registro solo permite el rol CUSTOMER');
        }
        console.log('👤 Auto-registro de CUSTOMER');
      }

      const fullphoneNumber = `+57${data.phone_number}`;

      // 3. ✅ Crear usuario en Firebase Auth
      const firebaseUser = await firebaseAuth.createUser({
        email: data.email,
        password: data.password,
        displayName: `${data.name} ${data.last_name}`,
        phoneNumber: fullphoneNumber,
        emailVerified: false,
      });

      firebaseUid = firebaseUser.uid;
      console.log('✅ Usuario creado en Firebase:', firebaseUid);

      // 4. ✅ Guardar en PostgreSQL
      const user = await userRepository.create({
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password: 'firebase_managed',
        phone_number: fullphoneNumber,
        role: data.role,
        company_id: data.company_id || null,
        firebase_uid: firebaseUid,
        auth_method: 'firebase',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Usuario creado en PostgreSQL:', user.id);

      // 5. ✅ Establecer Custom Claims en Firebase
      await firebaseAuth.setCustomUserClaims(firebaseUser.uid, {
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
      });

      console.log('✅ Custom claims establecidos');

      // 6. ✅ Generar Custom Token
      const customToken = await firebaseAuth.createCustomToken(firebaseUser.uid, {
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
      });

      // 7. 📧 PUNTO DE INTEGRACIÓN PARA EMAIL
      console.log('📧 ===== ENVIAR EMAIL DE CONFIRMACIÓN AQUÍ =====');
      console.log('📧 Datos para el email:', {
        to: user.email,
        name: user.name,
        role: user.role,
        isAutoRegister: !createdBy,
        createdByAdmin: createdBy ? `${createdBy.userRole} (ID: ${createdBy.userId})` : null,
      });
      
      // 7. 📧 Enviar email según rol y origen del registro
if (!createdBy) {
  // ── Auto-registro CUSTOMER ──────────────────────────
  try {
    const otpTemp = Math.floor(100000 + Math.random() * 900000).toString();
    await emailService.queueEmail({
      userId: user.id,
      email: user.email,
      templateCode: 'REGISTRATION_VERIFY_MAIL',
      variables: {
        user_name: `${user.name} ${user.last_name}`,
        otp_code: otpTemp,
        verify_link: 'https://paypac.co/verify-account',
      },
    });
    console.log('📧 Email de verificación encolado para:', user.email);
  } catch (emailError: any) {
    console.error('⚠️ No se pudo encolar el email de verificación:', emailError.message);
  }

} else {
  // ── Creado por admin (ORGANIZER, STAFF, STAFF_PROMOTER, PAYPAC) ──
  try {
    await emailService.queueEmail({
      userId: user.id,
      email: user.email,
      templateCode: 'REGISTRATION_ACCEPT',
      variables: {
        name: user.name,
        last_name: user.last_name,
        inviter_name: 'PayPac',       // TODO: traer nombre real del createdBy.userId si se requiere
        inviter_last_name: 'Admin',
        role: user.role,
        email: user.email,
        accept_link: 'https://paypac.co/login',
      },
    });
    console.log('📧 Email de invitación encolado para:', user.email);
  } catch (emailError: any) {
    console.error('⚠️ No se pudo encolar el email de invitación:', emailError.message);
  }
}


      console.log('📧 ============================================');
     
      // TODO: Aquí irá la integración con el servicio de email
      // await emailService.sendWelcomeEmail(user.email, user.name);
      
      // 8. 🎫 Buscar transferencias pendientes (solo CUSTOMER auto-registrado)
if (!createdBy && data.role === ROLES.CUSTOMER) {
  try {
    const { TicketTransactionService } = await import('./tickettransaction.service');
    const ticketTxService = new TicketTransactionService();

    // Buscar por email y por celular
    const byEmail = await ticketTxService.acceptByContact(user.id, user.email);
    const byPhone = await ticketTxService.acceptByContact(user.id, user.phone_number);

    const totalUpdated = (byEmail.updated ?? 0) + (byPhone.updated ?? 0);
    if (totalUpdated > 0) {
      console.log(`🎫 ${totalUpdated} transferencia(s) pendiente(s) asignadas al nuevo usuario ${user.id}`);
    }
  } catch (transferError: any) {
    console.error('⚠️ Error buscando transferencias pendientes:', transferError.message);
  }
}

      // 9. ✅ Retornar datos del usuario
      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        company_id: user.company_id,
        uid: user.firebase_uid,
        customToken: customToken,
      };
    } catch (error: any) {
      console.error('❌ Error en registro:', error.message);

      // Rollback: Si falla PostgreSQL y el usuario fue creado en Firebase, eliminarlo
      if (firebaseUid) {
        try {
          await firebaseAuth.deleteUser(firebaseUid);
          console.log('🔄 Rollback: Usuario eliminado de Firebase');
        } catch (rollbackError: any) {
          if (rollbackError.code === 'auth/user-not-found') {
            console.log('ℹ️ Usuario ya no existe en Firebase, rollback no necesario');
          } else {
            console.error('❌ Error en rollback:', rollbackError.message);
          }
        }
      }

      throw new Error(error.message || 'Error al registrar usuario');
    }
  }

  /**
   * Obtener todos los usuarios
   */
  async getUsers() {
    const users = await userRepository.findAll();
    return users;
  }
}


 /**
   * ❌ generateToken - YA NO SE USA
   * Firebase genera los tokens automáticamente
   * Puedes eliminar este método
   */
  // private generateToken(user: any) { ... }