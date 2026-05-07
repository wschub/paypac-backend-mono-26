import rateLimit from 'express-rate-limit';

const RATE_LIMIT_MESSAGE = 'Too many requests from this IP, please try again later.';

export const publicEventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_EVENTS || '60'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicEventDetailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_DETAIL || '100'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicLocalitiesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_LOCALITIES || '100'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicCatalogLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_CATEGORIES || '30'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicCitiesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEB_RATE_LIMIT_CITIES || '20'),
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicViewUpdateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: RATE_LIMIT_MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});
