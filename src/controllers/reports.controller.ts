import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { DateRangeKey } from '../repositories/analytics.repository';

const reportsService = new ReportsService();

const getRange = (req: Request) => ({
  rangeKey: (req.query.range as DateRangeKey) || 'month',
  from:     req.query.from as string | undefined,
  to:       req.query.to   as string | undefined,
});

// ── PAYPAC ────────────────────────────────────────────────────────────────────

export const getFinancialReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const data = await reportsService.getFinancialReport(rangeKey, from, to);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrganizersReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const data = await reportsService.getOrganizersReport(rangeKey, from, to);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getEventsPortfolioReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const data = await reportsService.getEventsPortfolioReport(rangeKey, from, to);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpansionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await reportsService.getExpansionReport();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getRiskReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const data = await reportsService.getRiskReport(rangeKey, from, to);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── ORGANIZER ─────────────────────────────────────────────────────────────────

export const getLiquidationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const event_id = Number(req.query.event_id);
    if (!event_id) { res.status(400).json({ message: 'event_id es requerido' }); return; }
    const data = await reportsService.getLiquidationReport(req.user!.id, event_id, rangeKey, from, to);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rangeKey, from, to } = getRange(req);
    const event_id    = Number(req.query.event_id);
    const granularity = (req.query.granularity as 'hour' | 'day') || 'day';
    const date        = req.query.date as string | undefined;
    if (!event_id) { res.status(400).json({ message: 'event_id es requerido' }); return; }
    const data = await reportsService.getSalesReport(req.user!.id, event_id, rangeKey, granularity, from, to, date);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getIntelligenceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const event_id = Number(req.query.event_id);
    if (!event_id) { res.status(400).json({ message: 'event_id es requerido' }); return; }
    const data = await reportsService.getIntelligenceReport(event_id);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};