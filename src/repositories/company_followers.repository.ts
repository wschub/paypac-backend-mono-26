import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class CompanyFollowersRepository {

  async follow(company_id: number, user_id: number) {
    return prisma.companyFollwers.create({
      data: { company_id, user_id },
    });
  }

  async unfollow(company_id: number, user_id: number) {
    return prisma.companyFollwers.deleteMany({
      where: { company_id, user_id },
    });
  }

  async isFollowing(company_id: number, user_id: number): Promise<boolean> {
    const count = await prisma.companyFollwers.count({
      where: { company_id, user_id },
    });
    return count > 0;
  }

  async findByCompany(company_id: number) {
    return prisma.companyFollwers.findMany({
      where: { company_id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            phone_number: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(user_id: number) {
    return prisma.companyFollwers.findMany({
      where: { user_id },
      include: {
        company: {
          select: {
            id: true,
            company_name: true,
            company_logo: true,
            company_description: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByCompany(company_id: number): Promise<number> {
    return prisma.companyFollwers.count({ where: { company_id } });
  }
}