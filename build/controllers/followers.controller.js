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
exports.FollowersController = void 0;
const followers_service_1 = require("../services/followers.service");
const followersService = new followers_service_1.FollowersService();
class FollowersController {
    followUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.id;
                const { following_id } = req.body;
                const follow = yield followersService.followUser(followerId, following_id);
                res.status(201).json({ follow });
            }
            catch (error) {
                console.error('Error in followUser:', error);
                if (error.message.includes('No puedes seguirte') || error.message.includes('Ya sigues')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                if (error.message.includes('no encontrado')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to follow user' });
            }
        });
    }
    unfollowUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.id;
                const followingId = parseInt(req.params.userId);
                yield followersService.unfollowUser(followerId, followingId);
                res.status(200).json({ message: 'Has dejado de seguir al usuario' });
            }
            catch (error) {
                console.error('Error in unfollowUser:', error);
                if (error.message.includes('No sigues')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to unfollow user' });
            }
        });
    }
    getMyFollowers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 20;
                const result = yield followersService.getMyFollowers(userId, page, limit);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in getMyFollowers:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch followers' });
            }
        });
    }
    getMyFollowing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 20;
                const result = yield followersService.getMyFollowing(userId, page, limit);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in getMyFollowing:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch following' });
            }
        });
    }
    blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const targetUserId = parseInt(req.params.userId);
                yield followersService.blockUser(userId, targetUserId);
                res.status(200).json({ message: 'Usuario bloqueado exitosamente' });
            }
            catch (error) {
                console.error('Error in blockUser:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to block user' });
            }
        });
    }
    muteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.id;
                const followingId = parseInt(req.params.userId);
                yield followersService.muteUser(followerId, followingId);
                res.status(200).json({ message: 'Usuario silenciado exitosamente' });
            }
            catch (error) {
                console.error('Error in muteUser:', error);
                if (error.message.includes('No sigues')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to mute user' });
            }
        });
    }
    unmuteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followerId = req.user.id;
                const followingId = parseInt(req.params.userId);
                yield followersService.unmuteUser(followerId, followingId);
                res.status(200).json({ message: 'Usuario reactivado exitosamente' });
            }
            catch (error) {
                console.error('Error in unmuteUser:', error);
                if (error.message.includes('No sigues')) {
                    return res.status(400).json({ error: 'Bad request', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to unmute user' });
            }
        });
    }
}
exports.FollowersController = FollowersController;
