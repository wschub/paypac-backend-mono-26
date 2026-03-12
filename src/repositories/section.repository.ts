import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class SectionRepository {

  async create(data: Prisma.SectionUncheckedCreateInput) {
    return prisma.section.create({ data });
  }

  async findAll() {
    return prisma.section.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.section.findUnique({
      where: { id },
      include: {
        children: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
        parent: true,
      },
    });
  }

  // Retorna secciones con permisos para un rol específico — usado en el menú
  async findMenuByRole(role: string) {
    return prisma.section.findMany({
      where: {
        is_active: true,
        parent_id: null, // solo raíces — children se anidan
        rolePermissions: {
          some: {
            role: role as any,
            can_view: true,
          },
        },
      },
      orderBy: { order: 'asc' },
      include: {
        rolePermissions: {
          where: { role: role as any },
        },
        children: {
          where: {
            is_active: true,
            rolePermissions: {
              some: { role: role as any, can_view: true },
            },
          },
          orderBy: { order: 'asc' },
          include: {
            rolePermissions: {
              where: { role: role as any },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.SectionUpdateInput) {
    return prisma.section.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.section.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async hardDelete(id: number) {
    return prisma.section.delete({ where: { id } });
  }

  async reorder(items: { id: number; order: number }[]) {
    return prisma.$transaction(
      items.map(item =>
        prisma.section.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
  }
}