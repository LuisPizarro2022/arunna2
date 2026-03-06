import { prisma } from '@/lib/prisma';
import { statuses } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { contactSchema } from '@/lib/validators';

async function createContact(formData: FormData) {
  'use server';
  const tagNames = String(formData.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean);
  const parsed = contactSchema.parse({
    name: String(formData.get('name') || ''),
    phoneE164: String(formData.get('phoneE164') || ''),
    notes: String(formData.get('notes') || ''),
    status: String(formData.get('status') || 'NUEVO')
  });
  await prisma.contact.create({
    data: {
      ...parsed,
      notes: parsed.notes || null,
      status: parsed.status as any,
      tags: {
        create: await Promise.all(tagNames.map(async (name) => {
          const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
          return { tagId: tag.id };
        }))
      }
    }
  });
  revalidatePath('/contacts');
}

async function deleteContact(formData: FormData) {
  'use server';
  await prisma.contact.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/contacts');
}

export default async function ContactsPage({ searchParams }: { searchParams?: { status?: string; tag?: string; q?: string } }) {
  const where: any = {};
  if (searchParams?.status) where.status = searchParams.status;
  if (searchParams?.q) where.name = { contains: searchParams.q };
  if (searchParams?.tag) where.tags = { some: { tag: { name: searchParams.tag } } };

  const [contacts, tags] = await Promise.all([
    prisma.contact.findMany({ where, include: { tags: { include: { tag: true } } }, orderBy: { updatedAt: 'desc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Contacts</h1>
      <form className="flex gap-2" method="GET">
        <input name="q" placeholder="Search" defaultValue={searchParams?.q || ''} />
        <select name="status" defaultValue={searchParams?.status || ''}><option value="">All statuses</option>{statuses.map((s)=><option key={s} value={s}>{s}</option>)}</select>
        <select name="tag" defaultValue={searchParams?.tag || ''}><option value="">All tags</option>{tags.map((t)=><option key={t.id} value={t.name}>{t.name}</option>)}</select>
        <button type="submit">Filter</button>
        <a className="rounded bg-emerald-700 px-3 py-1 text-white" href="/api/contacts/export">Export CSV</a>
      </form>
      <form action="/api/contacts/import" method="POST" encType="multipart/form-data" className="flex gap-2 rounded bg-white p-3">
        <input type="file" name="file" accept=".csv" required />
        <button type="submit">Import CSV</button>
      </form>
      <form action={createContact} className="grid grid-cols-5 gap-2 rounded bg-white p-3">
        <input name="name" placeholder="Name" required />
        <input name="phoneE164" placeholder="+1555000111" required />
        <select name="status">{statuses.map((s)=><option key={s} value={s}>{s}</option>)}</select>
        <input name="tags" placeholder="vip,buyer" />
        <input name="notes" placeholder="Notes" />
        <button className="col-span-5 w-fit" type="submit">Add contact</button>
      </form>

      {contacts.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded bg-white p-3">
          <div>
            <p className="font-medium">{c.name} · {c.phoneE164}</p>
            <p className="text-sm">{c.status} · {c.tags.map((t) => t.tag.name).join(', ')}</p>
          </div>
          <form action={deleteContact}><input type="hidden" name="id" value={c.id} /><button>Delete</button></form>
        </div>
      ))}
    </div>
  );
}
