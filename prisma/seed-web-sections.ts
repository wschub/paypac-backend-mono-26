import '../src/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Seed types ────────────────────────────────────────────────────────────
  const typeNames = ['CONTENT', 'CALENDAR', 'FILTERS', 'EVENTS'];
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

  // ── 2. Seed default group "Legales" ──────────────────────────────────────────
  const group = await prisma.webSectionsGroups.upsert({
    where: { id: 1 },
    update: {},
    create: { group_name: 'Legales', group_order: 1, group_lang: 'ES' },
  });
  console.log(`  ✔ Group: ${group.group_name} (id=${group.id})`);

  // ── 3. Seed privacy-policy & terms-conditions ────────────────────────────────
  const pages = [
    {
      menu_label: 'Política de Privacidad',
      title: 'Política de Privacidad',
      menu_url: '/privacy-policy',
      section_order: 1,
    },
    {
      menu_label: 'Términos y Condiciones',
      title: 'Términos y Condiciones',
      menu_url: '/terms-conditions',
      section_order: 2,
    },
  ];

  for (const page of pages) {
    const existing = await prisma.webSections.findFirst({
      where: { menu_url: page.menu_url },
    });
    if (!existing) {
      const s = await prisma.webSections.create({
        data: {
          lang: 'ES',
          group_id: group.id,
          type_id: types['CONTENT'],
          section_order: page.section_order,
          menu_label: page.menu_label,
          title: page.title,
          menu_url: page.menu_url,
        },
      });
      console.log(`  ✔ Section created: ${s.menu_label} → ${s.menu_url}`);
    } else {
      console.log(`  ↳ Section already exists: ${page.menu_url}`);
    }
  }

  console.log('\n✅ Seed completado');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
