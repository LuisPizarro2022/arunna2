import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { statuses } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

async function createCampaign(formData: FormData) {
  'use server';
  const contactIds = formData.getAll('contactIds').map(String);
  const messages = String(formData.get('messages') || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const campaign = await prisma.campaign.create({
    data: {
      name: String(formData.get('name')),
      accountId: String(formData.get('accountId')),
      minDelaySec: Number(formData.get('minDelaySec') || 5),
      maxDelaySec: Number(formData.get('maxDelaySec') || 20),
      messages: { create: messages.map((body, idx) => ({ order: idx + 1, body })) },
      targets: { create: contactIds.map((contactId) => ({ contactId })) }
    }
  });
  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${campaign.id}/run`);
}

export default async function CampaignsPage({ searchParams }: { searchParams?: { status?: string; tag?: string } }) {
  const [accounts, contacts, tags, campaigns] = await Promise.all([
    prisma.account.findMany({ where: { isActive: true } }),
    prisma.contact.findMany({
      where: {
        ...(searchParams?.status ? { status: searchParams.status as any } : {}),
        ...(searchParams?.tag ? { tags: { some: { tag: { name: searchParams.tag } } } } : {})
      },
      include: { tags: { include: { tag: true } } }
    }),
    prisma.tag.findMany(),
    prisma.campaign.findMany({ include: { account: true, _count: { select: { targets: true } } }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Campaigns</h1>
      <form className="flex gap-2" method="GET">
        <select name="status" defaultValue={searchParams?.status || ''}><option value="">All status</option>{statuses.map((s)=><option key={s}>{s}</option>)}</select>
        <select name="tag" defaultValue={searchParams?.tag || ''}><option value="">All tags</option>{tags.map((t)=><option key={t.id}>{t.name}</option>)}</select>
        <button type="submit">Filter contacts</button>
      </form>
      <form action={createCampaign} className="space-y-2 rounded bg-white p-3">
        <input name="name" placeholder="Campaign name" required />
        <select name="accountId" required><option value="">Select account</option>{accounts.map((a)=><option key={a.id} value={a.id}>{a.name} ({a.chromeProfileDir})</option>)}</select>
        <div className="flex gap-2"><input type="number" name="minDelaySec" defaultValue={10} /><input type="number" name="maxDelaySec" defaultValue={30} /></div>
        <textarea name="messages" rows={4} className="w-full" placeholder="One message line per sequence item" />
        <div className="max-h-40 overflow-auto border p-2">
          {contacts.map((c)=><label key={c.id} className="block"><input type="checkbox" name="contactIds" value={c.id} /> {c.name} · {c.phoneE164}</label>)}
        </div>
        <button>Create campaign</button>
      </form>

      {campaigns.map((c) => (
        <div key={c.id} className="flex justify-between rounded bg-white p-3">
          <div><p className="font-medium">{c.name}</p><p className="text-sm">{c.account.name} · contacts: {c._count.targets}</p></div>
          <Link className="rounded bg-blue-600 px-3 py-1 text-white" href={`/campaigns/${c.id}/run`}>Run campaign</Link>
        </div>
      ))}
    </div>
  );
}
