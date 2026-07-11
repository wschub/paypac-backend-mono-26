"use strict";
//import { PrismaClient } from '@prisma/client';
//export const prisma = new PrismaClient();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_1.Prisma; } });
// Instancia principal del cliente Prisma
exports.prisma = new client_1.PrismaClient();
