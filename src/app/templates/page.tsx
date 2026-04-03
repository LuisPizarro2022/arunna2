import { prisma } from '@/lib/prisma';
import { interpolateTemplate } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

async function createTemplate(formData: FormData) {
  'use server';
  await prisma.template.create({ data: { name: String(formData.get('name')), body: String(formData.get('body')) } });
  revalidatePath('/templates');
}

async function deleteTemplate(formData: FormData) {
  'use server';
  await prisma.template.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/templates');
}

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({ orderBy: { updatedAt: 'desc' } });
  const preview = interpolateTemplate('Hola {nombre}, proyecto {proyecto} desde {precio_desde}. Tel: {telefono}', { nombre: 'Ana', proyecto: 'Pixel', precio_desde: '120000', telefono: '+1555' });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Templates</h1>
      <div className="rounded bg-blue-50 p-3 text-sm">Preview sample: {preview}</div>
      <form action={createTemplate} className="space-y-2 rounded bg-white p-3">
        <input name="name" placeholder="Name" required />
        <textarea name="body" placeholder="Hola {nombre}" required className="w-full" rows={4} />
        <button>Create</button>
      </form>
      {templates.map((t)=><div key={t.id} className="rounded bg-white p-3"><p className="font-medium">{t.name}</p><pre className="whitespace-pre-wrap">{t.body}</pre><form action={deleteTemplate}><input type="hidden" name="id" value={t.id}/><button>Delete</button></form></div>)}
    </div>
  );
}
