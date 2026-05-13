import { prisma } from '../prisma/client';

export class InterestsService {

  async getMyInterests(userId: number) {
    const interests = await prisma.userInterest.findMany({
      where: { user_id: userId },
      include: {
        category: { select: { id: true, category_name: true } },
        subcategory: { select: { id: true, subcategory_name: true } },
        subgenre: { select: { id: true, subcategory_name: true } },
      },
      orderBy: [{ interest_level: 'desc' }, { createdAt: 'desc' }],
    });

    return interests.map((interest) => ({
      id: interest.id,
      category_id: interest.category_id,
      category_name: interest.category?.category_name || null,
      subcategory_id: interest.subcategory_id,
      subcategory_name: interest.subcategory?.subcategory_name || null,
      subgenre_id: interest.subgenre_id,
      subgenre_name: interest.subgenre?.subcategory_name || null,
      interest_level: interest.interest_level,
      source: interest.source,
      createdAt: interest.createdAt,
    }));
  }

  async createInterest(
    userId: number,
    categoryId: number,
    subcategoryId: number | undefined,
    subgenreId: number | undefined,
    interestLevel: number
  ) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new Error('Categoría no encontrada');

    if (subcategoryId) {
      const subcategory = await prisma.subCategory.findUnique({ where: { id: subcategoryId } });
      if (!subcategory) throw new Error('Subcategoría no encontrada');
    }

    if (subgenreId) {
      const subgenre = await prisma.subgenre.findUnique({ where: { id: subgenreId } });
      if (!subgenre) throw new Error('Subgénero no encontrado');
    }

    const existing = await prisma.userInterest.findFirst({
      where: {
        user_id: userId,
        category_id: categoryId,
        subcategory_id: subcategoryId ?? null,
        subgenre_id: subgenreId ?? null,
      },
    });

    if (existing) throw new Error('Ya tienes este interés registrado');

    return prisma.userInterest.create({
      data: {
        user_id: userId,
        category_id: categoryId,
        subcategory_id: subcategoryId ?? null,
        subgenre_id: subgenreId ?? null,
        interest_level: interestLevel,
        source: 'MANUAL',
      },
    });
  }

  async updateInterest(userId: number, interestId: number, interestLevel: number) {
    const interest = await prisma.userInterest.findFirst({
      where: { id: interestId, user_id: userId },
    });
    if (!interest) throw new Error('Interés no encontrado');

    return prisma.userInterest.update({
      where: { id: interestId },
      data: { interest_level: interestLevel },
    });
  }

  async deleteInterest(userId: number, interestId: number) {
    const interest = await prisma.userInterest.findFirst({
      where: { id: interestId, user_id: userId },
    });
    if (!interest) throw new Error('Interés no encontrado');

    await prisma.userInterest.delete({ where: { id: interestId } });
  }

  async recordInterestFromPurchase(
    userId: number,
    categoryId: number,
    subcategoryId?: number,
    subgenreId?: number
  ) {
    const existing = await prisma.userInterest.findFirst({
      where: {
        user_id: userId,
        category_id: categoryId,
        subcategory_id: subcategoryId ?? null,
        subgenre_id: subgenreId ?? null,
      },
    });

    if (existing) {
      if (existing.interest_level < 5) {
        await prisma.userInterest.update({
          where: { id: existing.id },
          data: {
            interest_level: Math.min(existing.interest_level + 1, 5),
            source: 'PURCHASE',
          },
        });
      }
    } else {
      await prisma.userInterest.create({
        data: {
          user_id: userId,
          category_id: categoryId,
          subcategory_id: subcategoryId ?? null,
          subgenre_id: subgenreId ?? null,
          interest_level: 1,
          source: 'PURCHASE',
        },
      });
    }
  }
}
