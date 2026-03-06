import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { accountSchema } from '@/lib/validators';

async function createAccount(formData: FormData) {
  'use server';
  const parsed = accountSchema.parse({
    name: String(formData.get('name') || ''),
    phoneE164: String(formData.get('phoneE164') || ''),
    chromeProfileDir: String(formData.get('chromeProfileDir') || 'Default')
  });
  await prisma.account.create({
    data: { ...parsed, phoneE164: parsed.phoneE164 || null, isActive: Boolean(formData.get('isActive')) }
  });
  revalidatePath('/accounts');
}

async function deleteAccount(formData: FormData) {
  'use server';
  await prisma.account.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/accounts');
}

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Accounts</h1>
      <form action={createAccount} className="grid grid-cols-4 gap-2 rounded bg-white p-3">
        <input name="name" placeholder="Name" required />
        <input name="phoneE164" placeholder="+1555000111" />
        <input name="chromeProfileDir" placeholder="Default / Profile 2" required defaultValue="Default" />
        <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        <button className="col-span-4 w-fit" type="submit">Create</button>
      </form>

      <div className="space-y-2">
        {accounts.map((acc) => (
          <div key={acc.id} className="flex items-center justify-between rounded bg-white p-3">
            <div>
              <p className="font-medium">{acc.name} ({acc.chromeProfileDir})</p>
              <p className="text-sm text-slate-500">{acc.phoneE164 || 'No phone'}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/api/accounts/${acc.id}/launch`} className="rounded bg-blue-600 px-3 py-1 text-white">Test launch</a>
              <form action={deleteAccount}>
                <input type="hidden" name="id" value={acc.id} />
                <button type="submit">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
