import { prisma } from '../config/db';
import { Company, Prisma } from '@prisma/client';

export class CompanyRepository {
  /**
   * Crear una nueva empresa
   */
  async create(data: Prisma.CompanyUncheckedCreateInput): Promise<Company> {
    return prisma.company.create({
      data,
      include: this.defaultInclude(),
    });
  }

  /**
   * Obtener todas las empresas con filtros opcionales
   */
  async findAll(filters?: {
    search?: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
    status?: number;
  }) {
    const where: Prisma.CompanyWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { company_name: { contains: filters.search, mode: 'insensitive' } },
        { company_email: { contains: filters.search, mode: 'insensitive' } },
        { company_description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.country_id) where.country_id = filters.country_id;
    if (filters?.state_id) where.state_id = filters.state_id;
    if (filters?.city_id) where.city_id = filters.city_id;
    if (filters?.status !== undefined) where.status = filters.status;

    return prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude(),
    });
  }

  /**
   * Buscar empresa por ID con relaciones completas
   */
  async findById(id: number) {
    return prisma.company.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
  }

  /**
   * Buscar empresa por nombre
   */
  async findByName(company_name: string): Promise<Company | null> {
    return prisma.company.findUnique({ where: { company_name } });
  }

  /**
   * Buscar empresa por email
   */
  async findByEmail(company_email: string): Promise<Company | null> {
    return prisma.company.findUnique({ where: { company_email } });
  }

  /**
   * Empresas registradas por un usuario (ORGANIZER)
   */
  async findByRegisteredUser(user_id_register: number) {
    return prisma.company.findMany({
      where: { user_id_register },
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude(),
    });
  }

  /**
   * Actualizar empresa
   */
  async update(id: number, data: Prisma.CompanyUncheckedUpdateInput) {
    return prisma.company.update({
      where: { id },
      data,
      include: this.defaultInclude(),
    });
  }

  /**
   * Actualizar solo el status
   */
  async updateStatus(id: number, status: number): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Actualizar fecha de aprobación
   */
  async approve(id: number): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data: {
        status: 1,
        approved_at: new Date(),
      },
    });
  }

  /**
   * Eliminar empresa
   */
  async delete(id: number): Promise<Company> {
    return prisma.company.delete({ where: { id } });
  }

  /**
   * Verificar si existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.company.count({ where: { id } });
    return count > 0;
  }

  /**
   * Estadísticas de empresas
   */
  async getStats(filters?: { country_id?: number; status?: number }) {
    const where: Prisma.CompanyWhereInput = {};
    if (filters?.country_id) where.country_id = filters.country_id;
    if (filters?.status !== undefined) where.status = filters.status;

    const [total, approved, pending, withRating] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.count({ where: { ...where, status: 1 } }),
      prisma.company.count({ where: { ...where, status: 0 } }),
      prisma.company.count({ where: { ...where, rating: { gt: 0 } } }),
    ]);

    return {
      total,
      approved,
      pending,
      with_rating: withRating,
    };
  }

  /**
   * Include reutilizable para relaciones comunes
   */
  private defaultInclude() {
    return {
      country: { select: { id: true, name_country: true, code: true } },
      state: { select: { id: true, name_state: true } },
      city: { select: { id: true, name_city: true } },
      registeredBy: {
        select: { id: true, name: true, last_name: true, email: true },
      },
      _count: { select: { users: true } },
    };
  }
}