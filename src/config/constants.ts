// Colombia (id 3 en la tabla countries)
export const DEFAULT_COUNTRY_ID = parseInt(process.env.DEFAULT_COUNTRY_ID || '3');

// ============================================
// REVENTA DE TICKETS
// ============================================
/** % de comisión PayPac sobre la reventa — se descuenta al vendedor (opción B) */
export const RESALE_COMMISSION_PCT = parseFloat(process.env.RESALE_COMMISSION_PCT || '10');
/** Minutos que tiene el ganador de una subasta para pagar tras aceptarse su oferta */
export const RESALE_PAYMENT_WINDOW_MIN = parseInt(process.env.RESALE_PAYMENT_WINDOW_MIN || '5');
export const WEB_API_KEY = process.env.WEB_API_KEY;

export const PUBLIC_EVENT_STATUSES = ['APPROVED', 'ACTIVE'] as const;
export const PUBLIC_EVENT_TYPE = 'PUBLICO' as const;

// ============================================
// SISTEMA DE PUNTOS
// ============================================
export const POINTS_CONFIG = {
  COST_POINT: 100,            // $100 COP = 1 punto
  COST_EXPIRATION_POINT: 365, // Días hasta expiración
  REDEMPTION_RATE: 10,        // 10 puntos = $1,000 descuento
  REDEMPTION_UNIT: 1000       // Unidad de canje
} as const;

export const calculatePointsFromAmount = (amount: number): number => {
  return Math.floor(amount / POINTS_CONFIG.COST_POINT);
};

export const calculateDiscountFromPoints = (points: number): number => {
  return Math.floor(points / POINTS_CONFIG.REDEMPTION_RATE) * POINTS_CONFIG.REDEMPTION_UNIT;
};

export const calculateExpirationDate = (fromDate: Date = new Date()): Date => {
  const expirationDate = new Date(fromDate);
  expirationDate.setDate(expirationDate.getDate() + POINTS_CONFIG.COST_EXPIRATION_POINT);
  return expirationDate;
};
