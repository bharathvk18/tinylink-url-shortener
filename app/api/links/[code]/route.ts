import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface Params {
  params: { code: string };
}

// GET /api/links/:code -> stats
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { code } = params;

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: link.code,
      targetUrl: link.targetUrl,
      clickCount: link.clickCount,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/links/:code -> delete link
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { code } = params;

    const existing = await prisma.link.findUnique({ where: { code } });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.link.delete({
      where: { code },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
