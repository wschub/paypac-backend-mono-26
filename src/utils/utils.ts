import { DateTime } from 'luxon';

export function cleanString(input: string): string {
    return input.replace(/"/g, '');
}

export function createNumInvoice(): string {
     // Prefijo inicial
  const prefix = 'PAC';
  // Generar números aleatorios para completar el tamaño necesario
  const randomNumbers = Math.floor(Math.random() * 1_000_000_000).toString().padStart(3, '0'); // 9 dígitos
  // Extraer los últimos 3 dígitos del timestamp
  const timestampPart = Date.now().toString().slice(-3); // Últimos 3 dígitos
  // Concatenar el resultado asegurando que tenga 15 caracteres
  const reference = `${prefix}${randomNumbers}${timestampPart}`.slice(0, 8);
  return reference;
}


/***/
export function createPaymentReference(): string {
     // Prefijo inicial
  const prefix = 'PAC';
  // Generar números aleatorios para completar el tamaño necesario
  const randomNumbers = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0'); // 9 dígitos
  // Extraer los últimos 3 dígitos del timestamp
  const timestampPart = Date.now().toString().slice(-3); // Últimos 3 dígitos
  // Concatenar el resultado asegurando que tenga 15 caracteres
  const reference = `${prefix}${randomNumbers}${timestampPart}`.slice(0, 15);
  return reference;
} 

//fecha
export function getExpirationTime(): string {
  // Hora actual en zona de Bogotá
  const nowInBogota = DateTime.now().setZone('America/Bogota');

  // Sumarle 30 minutos
  const limitTime = nowInBogota.plus({ minutes: 30 });

  const dateFormated = limitTime.toUTC().toISO({ suppressMilliseconds: false, includeOffset: false });

  // Convertir a UTC y retornarlo en formato ISO 8601 con milisegundos
  return dateFormated!.toString();
}


///adicionales
export const paramToInt = (param: string | string[]): number => {
  const value = Array.isArray(param) ? param[0] : param;
  return parseInt(value, 10);
};

