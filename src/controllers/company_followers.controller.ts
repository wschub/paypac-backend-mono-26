import { Request, Response } from 'express';
import { CompanyFollowersService } from '../services/company_followers.service';

const followersService = new CompanyFollowersService();

export const followCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.companyId);
    const userId    = req.user!.id;

    const result = await followersService.followCompany(companyId, userId);
    res.status(201).json(result);
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('Ya sigues')     ? 409 : 500;
    res.status(status).json({ message: err.message });
  }
};

export const unfollowCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.companyId);
    const userId    = req.user!.id;

    const result = await followersService.unfollowCompany(companyId, userId);
    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('No sigues')     ? 409 : 500;
    res.status(status).json({ message: err.message });
  }
};

export const getCompanyFollowers = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.companyId);
    const result    = await followersService.getCompanyFollowers(companyId);
    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404 : 500;
    res.status(status).json({ message: err.message });
  }
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await followersService.getFollowing(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const checkIsFollowing = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId  = Number(req.params.companyId);
    const userId     = req.user!.id;
    const isFollowing = await followersService.isFollowing(companyId, userId);
    res.status(200).json({ is_following: isFollowing });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};