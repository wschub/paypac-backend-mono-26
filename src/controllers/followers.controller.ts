import { Request, Response } from 'express';
import { FollowersService } from '../services/followers.service';

const followersService = new FollowersService();

export class FollowersController {

  async followUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const { following_id } = req.body;

      const follow = await followersService.followUser(followerId, following_id);
      res.status(201).json({ follow });
    } catch (error: any) {
      console.error('Error in followUser:', error);

      if (error.message.includes('No puedes seguirte') || error.message.includes('Ya sigues')) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to follow user' });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId as string);

      await followersService.unfollowUser(followerId, followingId);
      res.status(200).json({ message: 'Has dejado de seguir al usuario' });
    } catch (error: any) {
      console.error('Error in unfollowUser:', error);

      if (error.message.includes('No sigues')) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to unfollow user' });
    }
  }

  async getMyFollowers(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;

      const result = await followersService.getMyFollowers(userId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getMyFollowers:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch followers' });
    }
  }

  async getMyFollowing(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;

      const result = await followersService.getMyFollowing(userId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getMyFollowing:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch following' });
    }
  }

  async blockUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.params.userId as string);

      await followersService.blockUser(userId, targetUserId);
      res.status(200).json({ message: 'Usuario bloqueado exitosamente' });
    } catch (error: any) {
      console.error('Error in blockUser:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to block user' });
    }
  }

  async muteUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId as string);

      await followersService.muteUser(followerId, followingId);
      res.status(200).json({ message: 'Usuario silenciado exitosamente' });
    } catch (error: any) {
      console.error('Error in muteUser:', error);

      if (error.message.includes('No sigues')) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to mute user' });
    }
  }

  async unmuteUser(req: Request, res: Response) {
    try {
      const followerId = req.user!.id;
      const followingId = parseInt(req.params.userId as string);

      await followersService.unmuteUser(followerId, followingId);
      res.status(200).json({ message: 'Usuario reactivado exitosamente' });
    } catch (error: any) {
      console.error('Error in unmuteUser:', error);

      if (error.message.includes('No sigues')) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to unmute user' });
    }
  }
}
