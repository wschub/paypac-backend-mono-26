export const DEFAULT_COUNTRY_ID = parseInt(process.env.DEFAULT_COUNTRY_ID || '1');
export const WEB_API_KEY = process.env.WEB_API_KEY;

export const PUBLIC_EVENT_STATUSES = ['APPROVED', 'ACTIVE'] as const;
export const PUBLIC_EVENT_TYPE = 'PUBLICO' as const;
