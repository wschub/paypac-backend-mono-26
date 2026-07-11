"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramToString = exports.paramToInt = void 0;
exports.cleanString = cleanString;
exports.createNumInvoice = createNumInvoice;
exports.createPaymentReference = createPaymentReference;
exports.getExpirationTime = getExpirationTime;
const luxon_1 = require("luxon");
function cleanString(input) {
    return input.replace(/"/g, '');
}
function createNumInvoice() {
    // Prefijo inicial
    const prefix = 'PAC';
    // Generar números aleatorios para completar el tamaño necesario
    const randomNumbers = Math.floor(Math.random() * 1000000000).toString().padStart(3, '0'); // 9 dígitos
    // Extraer los últimos 3 dígitos del timestamp
    const timestampPart = Date.now().toString().slice(-3); // Últimos 3 dígitos
    // Concatenar el resultado asegurando que tenga 15 caracteres
    const reference = `${prefix}${randomNumbers}${timestampPart}`.slice(0, 8);
    return reference;
}
/***/
function createPaymentReference() {
    // Prefijo inicial
    const prefix = 'PAC';
    // Generar números aleatorios para completar el tamaño necesario
    const randomNumbers = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'); // 9 dígitos
    // Extraer los últimos 3 dígitos del timestamp
    const timestampPart = Date.now().toString().slice(-3); // Últimos 3 dígitos
    // Concatenar el resultado asegurando que tenga 15 caracteres
    const reference = `${prefix}${randomNumbers}${timestampPart}`.slice(0, 15);
    return reference;
}
//fecha
function getExpirationTime() {
    // Hora actual en zona de Bogotá
    const nowInBogota = luxon_1.DateTime.now().setZone('America/Bogota');
    // Sumarle 30 minutos
    const limitTime = nowInBogota.plus({ minutes: 30 });
    const dateFormated = limitTime.toUTC().toISO({ suppressMilliseconds: false, includeOffset: false });
    // Convertir a UTC y retornarlo en formato ISO 8601 con milisegundos
    return dateFormated.toString();
}
///adicionales
const paramToInt = (param) => {
    const value = Array.isArray(param) ? param[0] : param;
    return parseInt(value, 10);
};
exports.paramToInt = paramToInt;
/*
export const paramToString = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};
*/
const paramToString = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param;
};
exports.paramToString = paramToString;
