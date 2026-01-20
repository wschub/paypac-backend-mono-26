//import { PrismaClient } from '@prisma/client';
//export const prisma = new PrismaClient();

import { PrismaClient, Prisma } from '@prisma/client';

// Instancia principal del cliente Prisma
export const prisma = new PrismaClient();

// Exporta también el namespace de tipos
export { Prisma };
