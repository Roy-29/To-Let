import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ where: { uniqueCode: '' } });
    let updated = 0;
    for (const u of users) {
      const code = "TK-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      await prisma.user.update({ where: { id: u.id }, data: { uniqueCode: code } });
      updated++;
    }
    return NextResponse.json({ updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
