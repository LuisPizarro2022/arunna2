import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({ where: { id: params.id }, include: { targets: true } });
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const run = await prisma.campaignRun.create({
    data: {
      campaignId: campaign.id,
      status: 'RUNNING',
      items: { create: campaign.targets.map((t) => ({ contactId: t.contactId, state: 'PENDING' })) }
    }
  });
  return NextResponse.json({ runId: run.id });
}
