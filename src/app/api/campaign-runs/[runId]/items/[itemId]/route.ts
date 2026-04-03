import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { runId: string; itemId: string } }) {
  const body = await req.json();
  const state = body.state as 'OPENED' | 'SENT' | 'SKIPPED';
  const data: any = { state };
  if (state === 'OPENED') data.openedAt = new Date();
  if (state === 'SENT') data.sentAt = new Date();
  await prisma.campaignRunItem.update({ where: { id: params.itemId }, data });

  const pending = await prisma.campaignRunItem.count({ where: { runId: params.runId, state: 'PENDING' } });
  if (pending === 0) {
    await prisma.campaignRun.update({ where: { id: params.runId }, data: { status: 'DONE', finishedAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}
