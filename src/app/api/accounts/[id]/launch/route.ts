import { prisma } from '@/lib/prisma';
import { spawn } from 'node:child_process';
import { NextResponse } from 'next/server';

function getChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const account = await prisma.account.findUnique({ where: { id: params.id } });
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const url = new URL(req.url).searchParams.get('url') || 'https://web.whatsapp.com';
  const chromePath = getChromePath();
  const args = [`--profile-directory=${account.chromeProfileDir}`, url];

  try {
    const child = spawn(chromePath, args, { detached: true, stdio: 'ignore' });
    child.unref();
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, url, fallback: `Run: "${chromePath}" --profile-directory="${account.chromeProfileDir}" "${url}"` }, { status: 500 });
  }
}
