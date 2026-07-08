import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const cats = await prisma.category.findMany({ select: { id: true, category_name: true, country_id: true } });
const countries = await prisma.countries.findMany({ select: { id: true, name_country: true } });
console.log('Categories:', JSON.stringify(cats));
console.log('Countries:', JSON.stringify(countries));
await prisma.$disconnect();
