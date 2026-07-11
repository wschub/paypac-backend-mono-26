"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowersService = void 0;
const client_1 = require("../prisma/client");
class FollowersService {
    followUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (followerId === followingId)
                throw new Error('No puedes seguirte a ti mismo');
            const userToFollow = yield client_1.prisma.user.findUnique({ where: { id: followingId } });
            if (!userToFollow)
                throw new Error('Usuario no encontrado');
            const existing = yield client_1.prisma.userFollower.findUnique({
                where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
            });
            if (existing)
                throw new Error('Ya sigues a este usuario');
            const follow = yield client_1.prisma.userFollower.create({
                data: { follower_id: followerId, following_id: followingId, status: 'ACTIVE' },
            });
            yield client_1.prisma.notificationQueue.create({
                data: {
                    user_id: followingId,
                    notification_type: 'FRIEND_REQUEST',
                    channel: 'PUSH',
                    title: 'Nuevo seguidor',
                    body: `${userToFollow.name} comenzó a seguirte`,
                },
            });
            return follow;
        });
    }
    unfollowUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = yield client_1.prisma.userFollower.findUnique({
                where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
            });
            if (!follow)
                throw new Error('No sigues a este usuario');
            yield client_1.prisma.userFollower.delete({ where: { id: follow.id } });
        });
    }
    getMyFollowers(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [followers, total] = yield Promise.all([
                client_1.prisma.userFollower.findMany({
                    where: { following_id: userId, status: 'ACTIVE' },
                    include: {
                        follower: { select: { id: true, name: true, last_name: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                client_1.prisma.userFollower.count({ where: { following_id: userId, status: 'ACTIVE' } }),
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
        });
    }
    getMyFollowing(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 20) {
            const skip = (page - 1) * limit;
            const [following, total] = yield Promise.all([
                client_1.prisma.userFollower.findMany({
                    where: { follower_id: userId, status: 'ACTIVE' },
                    include: {
                        following: { select: { id: true, name: true, last_name: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                client_1.prisma.userFollower.count({ where: { follower_id: userId, status: 'ACTIVE' } }),
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
        });
    }
    blockUser(userId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const relations = yield client_1.prisma.userFollower.findMany({
                where: {
                    OR: [
                        { follower_id: userId, following_id: targetUserId },
                        { follower_id: targetUserId, following_id: userId },
                    ],
                },
            });
            yield Promise.all(relations.map((rel) => client_1.prisma.userFollower.update({ where: { id: rel.id }, data: { status: 'BLOCKED' } })));
        });
    }
    muteUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = yield client_1.prisma.userFollower.findUnique({
                where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
            });
            if (!follow)
                throw new Error('No sigues a este usuario');
            yield client_1.prisma.userFollower.update({ where: { id: follow.id }, data: { status: 'MUTED' } });
        });
    }
    unmuteUser(followerId, followingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follow = yield client_1.prisma.userFollower.findUnique({
                where: { follower_id_following_id: { follower_id: followerId, following_id: followingId } },
            });
            if (!follow)
                throw new Error('No sigues a este usuario');
            yield client_1.prisma.userFollower.update({ where: { id: follow.id }, data: { status: 'ACTIVE' } });
        });
    }
}
exports.FollowersService = FollowersService;
