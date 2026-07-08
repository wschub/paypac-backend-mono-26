import { Request, Response } from 'express';
import { EventRewardRulesService } from '../../services/eventrewardrules.service';

const rewardRulesService = new EventRewardRulesService();

/**
 * GET /api/public/discounts/validate/:code?event_id=123
 * Versión pública (X-Web-API-Key) del validador unificado de códigos:
 * type: 'discount' (dcto del organizador) | 'promoter' (código de promotor)
 */
export const validatePublicCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code).toUpperCase().trim();
    const eventId = Number(req.query.event_id);

    if (!eventId) {
      res.status(400).json({ message: 'event_id es requerido' });
      return;
    }

    const result = await rewardRulesService.validateCode(code, eventId);
    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en validatePublicCode:', err);
    res.status(400).json({ message: err.message });
  }
};
