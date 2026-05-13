import { prisma } from '../prisma/client';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generateUniqueSlug(baseText: string, excludeEventId?: number): Promise<string> {
  let slug = generateSlug(baseText);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await prisma.event.findFirst({
      where: {
        public_url: slug,
        ...(excludeEventId && { id: { not: excludeEventId } }),
      },
    });

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${generateSlug(baseText)}-${counter}`;
      counter++;
    }
  }

  return slug;
}
