'use client';

import { useMemo, useState } from 'react';

type Item = {
  id: string;
  state: 'PENDING' | 'OPENED' | 'SENT' | 'SKIPPED';
  contact: { id: string; name: string; phoneE164: string; notes: string | null };
};

export function RunQueue({ runId, accountId, minDelaySec, maxDelaySec, messages, items }: { runId: string; accountId: string; minDelaySec: number; maxDelaySec: number; messages: string[]; items: Item[] }) {
  const [currentItems, setCurrentItems] = useState(items);
  const [cooldown, setCooldown] = useState(0);
  const [tick, setTick] = useState(0);
  const next = useMemo(() => currentItems.find((i) => i.state === 'PENDING'), [currentItems, tick]);

  const message = useMemo(() => {
    if (!next) return '';
    return messages.join('\n').replace(/\{nombre\}/g, next.contact.name).replace(/\{telefono\}/g, next.contact.phoneE164);
  }, [next, messages]);

  async function updateState(itemId: string, state: 'OPENED' | 'SENT' | 'SKIPPED') {
    await fetch(`/api/campaign-runs/${runId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ state }) });
    setCurrentItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, state } : i)));
    if (state === 'SENT' || state === 'SKIPPED') {
      const wait = Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1)) + minDelaySec;
      setCooldown(wait);
      const interval = setInterval(() => setCooldown((v) => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      }), 1000);
      setTick((v) => v + 1);
    }
  }

  async function openWhatsapp() {
    if (!next) return;
    const target = `https://web.whatsapp.com/send?phone=${next.contact.phoneE164.replace('+', '')}&text=${encodeURIComponent(message)}`;
    await fetch(`/api/accounts/${accountId}/launch?url=${encodeURIComponent(target)}`);
    await updateState(next.id, 'OPENED');
  }

  return (
    <div className="space-y-3 rounded bg-white p-3">
      <p>Pending: {currentItems.filter((i) => i.state === 'PENDING').length}</p>
      {next ? (
        <>
          <p className="font-medium">Next: {next.contact.name} ({next.contact.phoneE164})</p>
          <textarea value={message} readOnly rows={6} className="w-full" />
          <div className="flex gap-2">
            <button type="button" onClick={openWhatsapp}>Open WhatsApp Web</button>
            <button type="button" onClick={() => updateState(next.id, 'SENT')} disabled={cooldown > 0}>Mark as Sent</button>
            <button type="button" onClick={() => updateState(next.id, 'SKIPPED')} disabled={cooldown > 0}>Skip</button>
          </div>
          <p className="text-sm">Manual assisted sending only. Wait timer: {cooldown}s</p>
        </>
      ) : <p>Queue done.</p>}
    </div>
  );
}
