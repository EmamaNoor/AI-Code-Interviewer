import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      include: {
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
