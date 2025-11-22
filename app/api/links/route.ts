import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// Generate random code if user does not provide one
function generateRandomCode(len = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;
    let code = body.code;

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Validate custom code
    if (code) {
      if (!CODE_REGEX.test(code)) {
        return NextResponse.json(
          { error: 'Code must be 6–8 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const exists = await prisma.link.findUnique({ where: { code } });
      if (exists) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
      }
    } else {
      // Generate auto code
      let unique = false;
      while (!unique) {
        const tmp = generateRandomCode(6);
        const exists = await prisma.link.findUnique({ where: { code: tmp } });
        if (!exists) {
          code = tmp;
          unique = true;
        }
      }
    }

    // Create link
    const link = await prisma.link.create({
      data: {
        code,
        targetUrl: url,
      },
    });

    return NextResponse.json(
      {
        code: link.code,
        targetUrl: link.targetUrl,
        clickCount: link.clickCount,
        lastClickedAt: link.lastClickedAt,
        createdAt: link.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      links.map((l) => ({
        code: l.code,
        targetUrl: l.targetUrl,
        clickCount: l.clickCount,
        lastClickedAt: l.lastClickedAt,
        createdAt: l.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
