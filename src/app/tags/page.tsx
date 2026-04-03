import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function createTag(formData: FormData) {
  'use server';
  await prisma.tag.create({ data: { name: String(formData.get('name')) } });
  revalidatePath('/tags');
}

async function deleteTag(formData: FormData) {
  'use server';
  await prisma.tag.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/tags');
}

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tags</h1>
      <form action={createTag} className="flex gap-2"><input name="name" required /><button>Create</button></form>
      {tags.map((t) => <div key={t.id} className="flex justify-between rounded bg-white p-3"><span>{t.name}</span><form action={deleteTag}><input type="hidden" name="id" value={t.id} /><button>Delete</button></form></div>)}
    </div>
  );
}
