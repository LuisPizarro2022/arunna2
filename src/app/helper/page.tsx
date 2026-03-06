import { prisma } from '@/lib/prisma';

function score(message: string, keyword: string, matchType: string) {
  const msg = message.toLowerCase();
  const key = keyword.toLowerCase();
  if (matchType === 'EXACT') return msg === key ? 100 : 0;
  if (matchType === 'STARTS_WITH') return msg.startsWith(key) ? 90 : 0;
  if (matchType === 'ENDS_WITH') return msg.endsWith(key) ? 80 : 0;
  return msg.includes(key) ? 70 : 0;
}

export default async function HelperPage({ searchParams }: { searchParams?: { message?: string; contactId?: string } }) {
  const [contacts, rules] = await Promise.all([
    prisma.contact.findMany({ orderBy: { name: 'asc' } }),
    prisma.rule.findMany({ where: { enabled: true } })
  ]);
  const message = searchParams?.message || '';
  const selected = contacts.find((c) => c.id === searchParams?.contactId);
  const matches = rules
    .map((r) => ({ ...r, score: score(message, r.keyword, r.matchType) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Rule helper</h1>
      <form className="space-y-2 rounded bg-white p-3" method="GET">
        <select name="contactId" defaultValue={searchParams?.contactId || ''}><option value="">Select contact</option>{contacts.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <textarea name="message" defaultValue={message} rows={4} className="w-full" placeholder="Paste incoming message" />
        <button type="submit">Suggest</button>
      </form>
      {matches.map((m) => {
        const url = selected ? `https://web.whatsapp.com/send?phone=${selected.phoneE164.replace('+', '')}&text=${encodeURIComponent(m.response)}` : '#';
        return <div key={m.id} className="rounded bg-white p-3"><p className="font-medium">{m.name}</p><p>{m.response}</p><div className="mt-2 flex gap-2"><span className="rounded border px-3 py-1">Copy response manually</span><a className="rounded bg-blue-600 px-3 py-1 text-white" href={url}>Open chat with response</a></div></div>;
      })}
    </div>
  );
}
