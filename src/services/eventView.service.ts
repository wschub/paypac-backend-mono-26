import { prisma } from '../prisma/client';
import { SalesChannel, DeviceType } from '@prisma/client';
import { Request } from 'express';

export class EventViewService {
  detectDeviceType(userAgent: string): DeviceType {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone/i.test(ua)) return 'MOBILE';
    if (/tablet|ipad/i.test(ua)) return 'TABLET';
    return 'DESKTOP';
  }

  async createView(
    eventId: number,
    data: {
      session_token: string;
      user_id?: number | null;
      session_channel: SalesChannel;
      country_id?: number | null;
      city_id?: number | null;
    },
    req: Request
  ) {
    const sessionIp =
      (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer =
      (req.headers['referer'] as string) ||
      (req.headers['referrer'] as string) ||
      null;
    const deviceType = this.detectDeviceType(userAgent);

    const existing = await prisma.eventView.findUnique({
      where: {
        event_id_session_token: {
          event_id: eventId,
          session_token: data.session_token,
        },
      },
    });

    if (existing) {
      return {
        id: existing.id,
        session_token: existing.session_token,
        message: 'View already exists',
      };
    }

    const view = await prisma.eventView.create({
      data: {
        event_id: eventId,
        user_id: data.user_id || null,
        session_token: data.session_token,
        session_duration: 0,
        session_ip: sessionIp,
        session_channel: data.session_channel,
        session_conversion: false,
        country_id: data.country_id || null,
        city_id: data.city_id || null,
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceType,
      },
    });

    return {
      id: view.id,
      session_token: view.session_token,
      message: 'View created',
    };
  }

  async updateDuration(eventId: number, sessionToken: string, duration: number) {
    const updated = await prisma.eventView.updateMany({
      where: {
        event_id: eventId,
        session_token: sessionToken,
      },
      data: {
        session_duration: { increment: duration },
      },
    });

    if (updated.count === 0) {
      throw new Error('View not found');
    }

    const view = await prisma.eventView.findUnique({
      where: {
        event_id_session_token: {
          event_id: eventId,
          session_token: sessionToken,
        },
      },
      select: { session_duration: true },
    });

    return {
      message: 'Duration updated',
      total_duration: view?.session_duration || 0,
    };
  }

  async markConversion(eventId: number, sessionToken: string) {
    const updated = await prisma.eventView.updateMany({
      where: {
        event_id: eventId,
        session_token: sessionToken,
      },
      data: {
        session_conversion: true,
      },
    });

    if (updated.count === 0) {
      console.warn(
        `No view found for conversion: event=${eventId}, token=${sessionToken}`
      );
    }

    return { message: 'Conversion marked' };
  }
}
