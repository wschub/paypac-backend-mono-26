import '../src/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Types ─────────────────────────────────────────────────────────────────
  const typeNames = ['CONTENT', 'CALENDAR', 'FILTERS', 'EVENTS', 'LINK'];
  const types: Record<string, number> = {};

  for (const name of typeNames) {
    const t = await prisma.webSectionsTypes.upsert({
      where: { type_name: name },
      update: {},
      create: { type_name: name },
    });
    types[name] = t.id;
    console.log(`  ✔ Type: ${name} (id=${t.id})`);
  }

  // ── 2. Groups ─────────────────────────────────────────────────────────────────
  // Rename existing "Legales" group to "Ayuda" and set correct order
  const groupAyuda = await prisma.webSectionsGroups.upsert({
    where: { id: 1 },
    update: { group_name: 'Ayuda', group_order: 3 },
    create: { group_name: 'Ayuda', group_order: 3, group_lang: 'ES' },
  });
  console.log(`  ✔ Group: ${groupAyuda.group_name} (id=${groupAyuda.id})`);

  const groupCompra = await prisma.webSectionsGroups.upsert({
    where: { id: 2 },
    update: { group_name: 'Compra', group_order: 1 },
    create: { group_name: 'Compra', group_order: 1, group_lang: 'ES' },
  });
  console.log(`  ✔ Group: ${groupCompra.group_name} (id=${groupCompra.id})`);

  const groupVende = await prisma.webSectionsGroups.upsert({
    where: { id: 3 },
    update: { group_name: 'Vende', group_order: 2 },
    create: { group_name: 'Vende', group_order: 2, group_lang: 'ES' },
  });
  console.log(`  ✔ Group: ${groupVende.group_name} (id=${groupVende.id})`);

  // ── 3. Sections ───────────────────────────────────────────────────────────────
  const sections = [
    // Compra
    { group_id: groupCompra.id, section_order: 1, type: 'CONTENT', menu_label: 'Ver eventos',  menu_url: '/eventos'   },
    { group_id: groupCompra.id, section_order: 2, type: 'CONTENT', menu_label: 'Categorías',   menu_url: '/categorias' },
    { group_id: groupCompra.id, section_order: 3, type: 'CONTENT', menu_label: 'Ciudades',     menu_url: '/ciudades'  },
    { group_id: groupCompra.id, section_order: 4, type: 'CONTENT', menu_label: 'Calendario',   menu_url: '/calendario' },
    // Vende
    { group_id: groupVende.id, section_order: 1, type: 'LINK',    menu_label: 'Para organizadores', menu_url: 'https://pro.paypac.co/' },
    { group_id: groupVende.id, section_order: 2, type: 'CONTENT', menu_label: 'Dashboard B2B',       menu_url: '/dashboard'  },
    { group_id: groupVende.id, section_order: 3, type: 'CONTENT', menu_label: 'Validación check-in', menu_url: '/validacion' },
    { group_id: groupVende.id, section_order: 4, type: 'CONTENT', menu_label: 'Precios',              menu_url: '/precios'    },
    // Ayuda — privacy-policy and terms-conditions already exist; add missing ones
    { group_id: groupAyuda.id, section_order: 1, type: 'CONTENT', menu_label: 'Centro de ayuda', menu_url: '/ayuda'        },
    { group_id: groupAyuda.id, section_order: 2, type: 'CONTENT', menu_label: 'Devoluciones',    menu_url: '/devoluciones' },
    // privacy-policy is section_order 3, terms-conditions is section_order 4 — update their orders
  ];

  for (const s of sections) {
    const existing = await prisma.webSections.findFirst({
      where: { group_id: s.group_id, menu_url: s.menu_url },
    });
    if (!existing) {
      await prisma.webSections.create({
        data: {
          lang: 'ES',
          group_id: s.group_id,
          section_order: s.section_order,
          type_id: types[s.type],
          menu_label: s.menu_label,
          menu_url: s.menu_url,
        },
      });
      console.log(`  ✔ Section created: [${s.type}] ${s.menu_label} → ${s.menu_url}`);
    } else {
      console.log(`  ↳ Already exists: ${s.menu_url}`);
    }
  }

  // Fix section_order for privacy-policy and terms-conditions
  await prisma.webSections.updateMany({
    where: { menu_url: '/privacy-policy' },
    data: { section_order: 3 },
  });
  await prisma.webSections.updateMany({
    where: { menu_url: '/terms-conditions' },
    data: { section_order: 4 },
  });
  console.log('  ✔ Updated section_order for /privacy-policy and /terms-conditions');

  console.log('\n✅ Seed completado');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
