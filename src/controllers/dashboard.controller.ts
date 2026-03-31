import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export const getPaypacDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getPaypacDashboard();
    res.status(200).json(data);
  } catch (err: any) {
    console.error('❌ Error en getPaypacDashboard:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getOrganizerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (!user.company_id) {
      res.status(400).json({ message: 'El usuario no tiene empresa asignada' });
      return;
    }
    const data = await dashboardService.getOrganizerDashboard(user.id, user.company_id);
    res.status(200).json(data);
  } catch (err: any) {
    console.error('❌ Error en getOrganizerDashboard:', err);
    res.status(500).json({ message: err.message });
  }
};

//organizer app dashboard
export const getOrganizerAppDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const data = await dashboardService.getOrganizerAppDashboard(user.id);
    res.status(200).json(data);
  } catch (err: any) {
    console.error('❌ Error en getOrganizerAppDashboard:', err);
    res.status(500).json({ message: err.message });
  }
};