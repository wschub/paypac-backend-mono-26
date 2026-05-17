import { prisma } from '../prisma/client';
import { PromoterRequestStatus } from '@prisma/client';

const include = {
  user: { select: { id: true, name: true, last_name: true, email: true, phone_number: true } },
  reviewed_by: { select: { id: true, name: true, last_name: true } },
};

export class PromoterRequestRepository {
  async create(user_id: number, motivation?: string) {
    return prisma.promoterRequest.create({ data: { user_id, motivation }, include });
  }

  async findById(id: number) {
    return prisma.promoterRequest.findUnique({ where: { id }, include });
  }

  async findByUserId(user_id: number) {
    return prisma.promoterRequest.findFirst({
      where: { user_id },
      orderBy: { createdAt: 'desc' },
      include,
    });
  }

  async findPendingByUserId(user_id: number) {
    return prisma.promoterRequest.findFirst({
      where: { user_id, status: 'PENDING' },
    });
  }

  async findAll(status?: PromoterRequestStatus) {
    return prisma.promoterRequest.findMany({
      where: status ? { status } : undefined,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: number,
    status: PromoterRequestStatus,
    reviewedById: number,
    rejectionReason?: string
  ) {
    return prisma.promoterRequest.update({
      where: { id },
      data: {
        status,
        reviewed_by_id: reviewedById,
        reviewed_at: new Date(),
        rejection_reason: rejectionReason ?? null,
      },
      include,
    });
  }
}
