import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Unique code is required' }, { status: 400 });
    }

    const foundUser = await prisma.user.findUnique({
      where: { uniqueCode: code },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        uniqueCode: true,
        ownedProperties: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            city: true,
            rent: true,
            propertyType: true,
          }
        }
      }
    });

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: foundUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
