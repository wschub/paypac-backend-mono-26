import { CompanyFollowersRepository } from '../repositories/company_followers.repository';
import { prisma } from '../config/db';

const followersRepo = new CompanyFollowersRepository();

export class CompanyFollowersService {

  async followCompany(companyId: number, userId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Empresa no encontrada');

    const already = await followersRepo.isFollowing(companyId, userId);
    if (already) throw new Error('Ya sigues a esta empresa');

    const follow = await followersRepo.follow(companyId, userId);
    return { follow, message: `Ahora sigues a ${company.company_name}` };
  }

  async unfollowCompany(companyId: number, userId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Empresa no encontrada');

    const following = await followersRepo.isFollowing(companyId, userId);
    if (!following) throw new Error('No sigues a esta empresa');

    await followersRepo.unfollow(companyId, userId);
    return { message: `Dejaste de seguir a ${company.company_name}` };
  }

  async getCompanyFollowers(companyId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Empresa no encontrada');

    const followers = await followersRepo.findByCompany(companyId);
    const total     = await followersRepo.countByCompany(companyId);

    return { total, followers };
  }

  async getFollowing(userId: number) {
    const following = await followersRepo.findByUser(userId);
    return { total: following.length, following };
  }

  async isFollowing(companyId: number, userId: number) {
    return followersRepo.isFollowing(companyId, userId);
  }
}