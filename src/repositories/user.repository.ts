import { prisma } from '../config/db';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  /**
   * Crear un nuevo usuario
   */
  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Buscar usuario por firebase_uid (uid)
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { firebase_uid: firebaseUid },
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Obtener todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener usuarios por rol
   */
  async findByRole(role: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener usuarios por company_id
   */
  async findByCompanyId(companyId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { company_id: companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar usuario
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar usuario
   */
  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Verificar si un usuario existe por email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Verificar si un usuario existe por ID
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar usuarios por rol
   */
  async countByRole(role: string): Promise<number> {
    return prisma.user.count({
      where: { role },
    });
  }

  /**
   * Obtener usuarios con relaciones completas
   */
  async findByIdWithRelations(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        paymentMethods: true,
        userCompanyRoles: {
          include: {
            role: true,
            company: true,
          },
        },
        company: true,
      },
    });
  }
}