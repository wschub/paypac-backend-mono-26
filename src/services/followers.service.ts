import { prisma } from '../prisma/client';

export class FollowersService {

  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error('No puedes seguirte a ti mismo');

    const userToFollow = await prisma.user.findUnique({ where: { id: followingId } });
    if (!userToFollow) throw new Error('Usuario no encontrado');

    const existing = await prisma.userFollower.findUnique({
      where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
    });
    if (existing) throw new Error('Ya sigues a este usuario');

    const follow = await prisma.userFollower.create({
      data: { follower_id: followerId, following_id: followingId, status: 'ACTIVE' },
    });

    await prisma.notificationQueue.create({
      data: {
        user_id: followingId,
        notification_type: 'FRIEND_REQUEST',
        channel: 'PUSH',
        title: 'Nuevo seguidor',
        body: `${userToFollow.name} comenzó a seguirte`,
      },
    });

    return follow;
  }

  async unfollowUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
    });
    if (!follow) throw new Error('No sigues a este usuario');

    await prisma.userFollower.delete({ where: { id: follow.id } });
  }

  async getMyFollowers(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.userFollower.findMany({
        where: { following_id: userId, status: 'ACTIVE' },
        include: {
          follower: { select: { id: true, name: true, last_name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userFollower.count({ where: { following_id: userId, status: 'ACTIVE' } }),
    ]);

    return {
      followers: followers.map((f) => ({
        id: f.id,
        follower_id: f.follower_id,
        follower_name: `${f.follower.name} ${f.follower.last_name}`,
        follower_email: f.follower.email,
        status: f.status,
        createdAt: f.createdAt,
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async getMyFollowing(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.userFollower.findMany({
        where: { follower_id: userId, status: 'ACTIVE' },
        include: {
          following: { select: { id: true, name: true, last_name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userFollower.count({ where: { follower_id: userId, status: 'ACTIVE' } }),
    ]);

    return {
      following: following.map((f) => ({
        id: f.id,
        following_id: f.following_id,
        following_name: `${f.following.name} ${f.following.last_name}`,
        following_email: f.following.email,
        status: f.status,
        createdAt: f.createdAt,
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async blockUser(userId: number, targetUserId: number) {
    const relations = await prisma.userFollower.findMany({
      where: {
        OR: [
          { follower_id: userId, following_id: targetUserId },
          { follower_id: targetUserId, following_id: userId },
        ],
      },
    });

    await Promise.all(
      relations.map((rel) =>
        prisma.userFollower.update({ where: { id: rel.id }, data: { status: 'BLOCKED' } })
      )
    );
  }

  async muteUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
    });
    if (!follow) throw new Error('No sigues a este usuario');

    await prisma.userFollower.update({ where: { id: follow.id }, data: { status: 'MUTED' } });
  }

  async unmuteUser(followerId: number, followingId: number) {
    const follow = await prisma.userFollower.findUnique({
      where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
    });
    if (!follow) throw new Error('No sigues a este usuario');

    await prisma.userFollower.update({ where: { id: follow.id }, data: { status: 'ACTIVE' } });
  }
}
