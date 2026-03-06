import { prisma } from '@/lib/prisma';
import { RunQueue } from '@/components/campaign/run-queue';

export default async function RunPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      account: true,
      messages: { orderBy: { order: 'asc' } },
      runs: { orderBy: { startedAt: 'desc' }, take: 1, include: { items: { include: { contact: true } } } }
    }
  });
  if (!campaign) return <div>Campaign not found.</div>;

  let run = campaign.runs[0];
  if (!run || run.status === 'DONE') {
    const created = await prisma.campaignRun.create({
      data: {
        campaignId: campaign.id,
        status: 'RUNNING',
        items: { create: (await prisma.campaignTarget.findMany({ where: { campaignId: campaign.id } })).map((t) => ({ contactId: t.contactId, state: 'PENDING' })) }
      },
      include: { items: { include: { contact: true } } }
    });
    run = created;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Run: {campaign.name}</h1>
      <RunQueue
        runId={run.id}
        accountId={campaign.accountId}
        minDelaySec={campaign.minDelaySec}
        maxDelaySec={campaign.maxDelaySec}
        messages={campaign.messages.map((m) => m.body)}
        items={run.items as any}
      />
    </div>
  );
}
