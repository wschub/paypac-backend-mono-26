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
   *
   * ✅ OPTIMIZACIONES APLICADAS:
   * 1. Promise.all para setCustomUserClaims + createCustomToken
   * 2. Fire-and-forget para queueEmail (no bloquea respuesta)
   * 3. Fire-and-forget para acceptByContact (no bloquea respuesta)
   * 4. Se eliminó dynamic import repetido — se importa al inicio si es necesario
   */
  async register(
    data: {
      name: string;
      last_name: string;
      email: string;
      password: string;
      phone_number: string;
      role: ROLES;
      company_id?: number | null;
      source?: 'app' | 'web';
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
      /*if (createdBy) {
        console.log(`👤 Usuario creado por: ${createdBy.userRole} (ID: ${createdBy.userId})`);

        if (createdBy.userRole === 'ORGANIZER') {
          const allowedRoles: ROLES[] = [ROLES.STAFF, ROLES.STAFF_PROMOTER, ROLES.PROMOTER, ROLES.CUSTOMER];
          if (!allowedRoles.includes(data.role)) {
            throw new Error('ORGANIZER solo puede crear usuarios con roles: STAFF, STAFF_PROMOTER, PROMOTER, CUSTOMER');
          }
        }
      } else {
        if (data.role !== ROLES.CUSTOMER) {
          throw new Error('El auto-registro solo permite el rol CUSTOMER');
        }
        console.log('👤 Auto-registro de CUSTOMER');
      }
*/
      const fullphoneNumber = `+57${data.phone_number}`;

      // 3. ✅ Crear usuario en Firebase Auth
      //    ⚠️ Esta es la operación más lenta (~400ms) — no se puede evitar
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

      // 5. ✅ OPTIMIZACIÓN: Paralelizar Claims + Custom Token
      //    - setCustomUserClaims: round-trip a Google (~300-400ms)
      //    - createCustomToken: firma LOCAL con service account key (~5ms)
      //    - Son independientes entre sí → Promise.all
      const claimsPayload = {
        userId: user.id,
        companyId: user.company_id,
        role: user.role,
      };

      const [, customToken] = await Promise.all([
        firebaseAuth.setCustomUserClaims(firebaseUser.uid, claimsPayload),
        firebaseAuth.createCustomToken(firebaseUser.uid, claimsPayload),
      ]);

      console.log('✅ Custom claims + token generados en paralelo');

      // 6. ✅ OPTIMIZACIÓN: Fire-and-forget para email
      //    El usuario NO necesita esperar a que el email se encole
      //    para ver "Registro exitoso"
      this._sendRegistrationEmail(user, createdBy, data.source);

      // 7. ✅ OPTIMIZACIÓN: Fire-and-forget para transferencias pendientes
      //    Solo para CUSTOMER auto-registrado
      //    ⚠️ Flutter YA NO debe llamar accept-by-contact — solo el backend lo hace
      if (!createdBy && data.role === ROLES.CUSTOMER) {
        this._acceptPendingTransfers(user.id, user.email, user.phone_number);
      }

      // 8. ✅ Retornar INMEDIATAMENTE — no esperar email ni transferencias
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

      // Rollback: Si falla después de crear en Firebase, eliminarlo
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

  // ─── MÉTODOS PRIVADOS (fire-and-forget) ───────────────────────────

  /**
   * Enviar email de registro en background
   * ⚠️ NO retorna Promise al caller — fire-and-forget
   */
  private _sendRegistrationEmail(
    user: { id: number; email: string; name: string; last_name: string; role: string },
    createdBy?: { userId: number; userRole: string },
    source?: 'app' | 'web'
  ): void {
    const task = async () => {
      if (!createdBy) {
        // Generar y persistir OTP (válido 5 minutos)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await userRepository.update(user.id, {
          email_verification_code: otp,
          email_verification_expires_at: expiresAt,
        });

        if (source === 'web') {
          const webUrl = process.env.WEB_URL || 'https://paypac.co';
          await emailService.queueEmail({
            userId: user.id,
            email: user.email,
            templateCode: 'REGISTRATION_VERIFY_MAIL_WEB',
            variables: {
              user_name: `${user.name} ${user.last_name}`,
              verify_link: `${webUrl}/verify-email?code=${otp}`,
            },
          });
        } else {
          await emailService.queueEmail({
            userId: user.id,
            email: user.email,
            templateCode: 'REGISTRATION_VERIFY_MAIL_v1',
            variables: {
              user_name: `${user.name} ${user.last_name}`,
              otp_code: otp,
              verify_link: '',
            },
          });
        }
        console.log('📧 Email de verificación encolado para:', user.email);
      } else {
        // Creado por admin
        await emailService.queueEmail({
          userId: user.id,
          email: user.email,
          templateCode: 'REGISTRATION_ACCEPT',
          variables: {
            name: user.name,
            last_name: user.last_name,
            inviter_name: 'PayPac',
            inviter_last_name: 'Admin',
            role: user.role,
            email: user.email,
            accept_link: 'https://paypac.co/login',
          },
        });
        console.log('📧 Email de invitación encolado para:', user.email);
      }
    };

    // Ejecutar sin await — errores se loguean pero no bloquean
    task().catch((err) => {
      console.error('⚠️ Error en email background:', err.message);
    });
  }

  /**
   * Aceptar transferencias pendientes en background
   * ⚠️ NO retorna Promise al caller — fire-and-forget
   * ⚠️ Flutter NO debe llamar accept-by-contact — esta es la ÚNICA ejecución
   */
  private _acceptPendingTransfers(
    userId: number,
    email: string,
    phoneNumber: string
  ): void {
    const task = async () => {
      const { TicketTransactionService } = await import('./tickettransaction.service');
      const ticketTxService = new TicketTransactionService();

      // Buscar por email Y por teléfono en paralelo
      const [byEmail, byPhone] = await Promise.all([
        ticketTxService.acceptByContact(userId, email),
        ticketTxService.acceptByContact(userId, phoneNumber),
      ]);

      const totalUpdated = (byEmail.updated ?? 0) + (byPhone.updated ?? 0);
      if (totalUpdated > 0) {
        console.log(`🎫 ${totalUpdated} transferencia(s) asignadas al usuario ${userId}`);
      }
    };

    task().catch((err) => {
      console.error('⚠️ Error en accept transfers background:', err.message);
    });
  }

  /**
   * Verificar email con código OTP (app y web)
   */
  async verifyEmailCode(userId: number, code: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    if (user.verified_user === 1) throw new Error('El email ya está verificado');

    if (!user.email_verification_code || !user.email_verification_expires_at) {
      throw new Error('No hay un código de verificación pendiente');
    }

    if (user.email_verification_code !== code) {
      throw new Error('Código incorrecto');
    }

    if (new Date() > user.email_verification_expires_at) {
      throw new Error('El código ha expirado');
    }

    await userRepository.update(userId, {
      email_verified_at: new Date(),
      verified_user: 1,
      email_verification_code: null,
      email_verification_expires_at: null,
    });

    return { verified: true };
  }

  /**
   * Obtener todos los usuarios
   */
  async getUsers() {
    const users = await userRepository.findAll();
    return users;
  }
}
