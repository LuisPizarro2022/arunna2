import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function createRule(formData: FormData) {
  'use server';
  await prisma.rule.create({ data: {
    name: String(formData.get('name')),
    keyword: String(formData.get('keyword')),
    matchType: formData.get('matchType') as any,
    response: String(formData.get('response')),
    enabled: Boolean(formData.get('enabled'))
  } });
  revalidatePath('/rules');
}

async function deleteRule(formData: FormData) {
  'use server';
  await prisma.rule.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/rules');
}

export default async function RulesPage() {
  const rules = await prisma.rule.findMany({ orderBy: { name: 'asc' } });
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Rules</h1>
    <form action={createRule} className="grid grid-cols-5 gap-2 rounded bg-white p-3">
      <input name="name" placeholder="Name" required />
      <input name="keyword" placeholder="Keyword" required />
      <select name="matchType"><option>CONTAINS</option><option>STARTS_WITH</option><option>ENDS_WITH</option><option>EXACT</option></select>
      <input name="response" placeholder="Response" required />
      <label className="flex items-center gap-2"><input type="checkbox" name="enabled" defaultChecked /> Enabled</label>
      <button className="col-span-5 w-fit">Create</button>
    </form>
    {rules.map((r)=><div key={r.id} className="flex justify-between rounded bg-white p-3"><span>{r.name} · {r.matchType} · {r.keyword}</span><form action={deleteRule}><input type="hidden" name="id" value={r.id}/><button>Delete</button></form></div>)}
  </div>;
}
