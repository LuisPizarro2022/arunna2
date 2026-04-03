import { prisma } from '@/lib/prisma';
import { csvEscape } from '@/lib/utils';

export async function GET() {
  const contacts = await prisma.contact.findMany({ include: { tags: { include: { tag: true } } }, orderBy: { createdAt: 'asc' } });
  const rows = ['name,phoneE164,notes,status,tags'];
  for (const c of contacts) {
    rows.push([
      csvEscape(c.name),
      csvEscape(c.phoneE164),
      csvEscape(c.notes ?? ''),
      c.status,
      csvEscape(c.tags.map((t) => t.tag.name).join('|'))
    ].join(','));
  }
  return new Response(rows.join('\n'), { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="contacts.csv"' } });
}
