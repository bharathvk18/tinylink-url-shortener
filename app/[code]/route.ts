import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest, { params }: any) {
  const { code } = await params;  // REQUIRED in Next.js 16

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Update click count
  await prisma.link.update({
    where: { code },
    data: {
      clickCount: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  // Normalize + validate URL
  let url: URL;
  try {
    url = new URL(link.targetUrl);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Invalid URL stored in database',
        detail: String(err),
        url: link.targetUrl,
      },
      { status: 500 }
    );
  }

  // Redirect safely
  return NextResponse.redirect(url);
}
