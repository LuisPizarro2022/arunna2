import { prisma } from '@/lib/prisma';
import { normalizePhone, parseCsvLine } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('file');
  if (!(file instanceof File)) return NextResponse.redirect(new URL('/contacts?import=0', req.url));
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const phone = normalizePhone(cols[idx.phoneE164] || '');
    if (!phone) continue;
    const tags = (cols[idx.tags] || '').split('|').map((t) => t.trim()).filter(Boolean);

    await prisma.contact.upsert({
      where: { phoneE164: phone },
      update: { name: cols[idx.name] || phone, notes: cols[idx.notes] || null, status: (cols[idx.status] as any) || 'NUEVO' },
      create: { name: cols[idx.name] || phone, phoneE164: phone, notes: cols[idx.notes] || null, status: (cols[idx.status] as any) || 'NUEVO' }
    });

    const contact = await prisma.contact.findUnique({ where: { phoneE164: phone } });
    if (!contact) continue;
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } });
      await prisma.contactTag.upsert({ where: { contactId_tagId: { contactId: contact.id, tagId: tag.id } }, update: {}, create: { contactId: contact.id, tagId: tag.id } });
    }
  }

  return NextResponse.redirect(new URL('/contacts?import=1', req.url));
}
